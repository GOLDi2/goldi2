-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		Configuration FIFO for initailization of chips (ROM-based)
-- Module Name:		ROM16XN_FIFO
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V3.01.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! MachX02 library
library machxo2;
use machxo2.all;
--! Use custom packages
library work;
use work.GOLDI_DATA_TYPES.all;




--! @brief
--! @details
--!
entity ROM16XN_FIFO is
    generic(
        g_data_width    :   integer := 16;
        g_init_delay    :   integer := 100;
        g_init_values   :   array_16_bit := (x"00FF",x"000F")
    );
    port(
        --General 
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Flag
        o_fifo_empty    : out   std_logic;
        --Data interface
        i_cword_tready  : in    std_logic;
        o_cword_tvalid  : out   std_logic;
        o_cword_tdata   : out   std_logic_vector(g_data_width-1 downto 0)
    );
end entity;



--! General architecture
architecture RTL of ROM16XN_FIFO is
    
    --****COMPONENTS****
    component ROM16X1A
        generic(
            INITVAL : in std_logic_vector(15 downto 0)
        );
        port(
            AD3     : in  std_logic; 
            AD2     : in  std_logic; 
            AD1     : in  std_logic; 
            AD0     : in  std_logic;
            DO0     : out  std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Data buffers
    signal rom_output           :   std_logic_vector(g_init_values'high downto 0);
    --Counters
    signal delay_counter        :   integer range 0 to g_init_delay; 
    signal rom_bit_counter      :   unsigned(3 downto 0);
    signal rom_blocK_counter    :   integer range 0 to g_init_values'length;
    signal data_bit_counter     :   integer range 0 to g_data_width;
    --State Machine
    type fifo_state is (s_idle, s_delay, s_load, s_transfer);
    signal ps_fifo  :   fifo_state;


begin

    --****ROM****
    -----------------------------------------------------------------------------------------------
    MEMORY : for i in 0 to g_init_values'length-1 generate
        ROM : ROM16X1A
        generic map(
            INITVAL     =>  g_init_values(i)
        )
        port map(
            AD3         => rom_bit_counter(3),
            AD2         => rom_bit_counter(2),
            AD1         => rom_bit_counter(1),
            AD0         => rom_bit_counter(0),
            DO0         => rom_output(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------


    
    --****STATE MACHINE****
    -----------------------------------------------------------------------------------------------
    FIFO_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            ps_fifo <= s_delay;
        elsif(rising_edge(clk)) then
            case ps_fifo is
            when s_delay    =>  
                if(delay_counter = g_init_delay-1) then ps_fifo <= s_load;
                else ps_fifo <= s_delay;
                end if; 
    
            when s_load     => 
                if(data_bit_counter = g_data_width-1) then
                    ps_fifo <= s_transfer;
                elsif(rom_bit_counter = "1111" and rom_blocK_counter = g_init_values'length-1) then
                    ps_fifo <= s_idle;
                else
                    ps_fifo <= s_load;
                end if;

            when s_transfer =>
                if(i_cword_tready = '1' and rom_blocK_counter = g_init_values'length) then
                    ps_fifo <= s_idle;
                elsif(i_cword_tready = '1') then
                    ps_fifo <= s_load;
                else
                    ps_fifo <= s_transfer;
                end if;                

            when s_idle     =>
                ps_fifo <= s_idle;
            when others     => null;
            end case;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****DATA INTERFACE****
    -----------------------------------------------------------------------------------------------
    EMPTY_FLAG_CONTROL : process(rst,ps_fifo)
    begin
        if(rst = '1') then
            o_fifo_empty <= '0';
        elsif(ps_fifo = s_idle) then
            o_fifo_empty <= '1';
        else
            o_fifo_empty <= '0';
        end if;
    end process;


    READY_FLAG_CONTROL : process(rst,ps_fifo)
    begin
        if(rst = '1') then
            o_cword_tvalid <= '0';
        elsif(ps_fifo = s_transfer) then
            o_cword_tvalid <= '1';
        else
            o_cword_tvalid <= '0';
        end if;
    end process;


    DATA_CONTROL : process(clk, rst)
    begin
        if(rst = '1') then
            o_cword_tdata <= (others => '0');
        elsif(rising_edge(clk)) then
            if(ps_fifo = s_delay or ps_fifo = s_idle) then
                o_cword_tdata <= (others => '0');
            elsif(ps_fifo = s_load) then
                o_cword_tdata(data_bit_counter) <= rom_output(rom_blocK_counter);
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    INIT_DELAY_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            delay_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_fifo /= s_delay) then
                delay_counter <= 0;
            elsif(delay_counter = g_init_delay) then
                delay_counter <= 0;
            else
                delay_counter <= delay_counter + 1;
            end if;
        end if;
    end process;


    BIT_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            rom_bit_counter <= (others => '0');
        elsif(rising_edge(clk)) then
            if(ps_fifo = s_delay) then
                rom_bit_counter <= (others => '0');
            elsif(ps_fifo = s_load) then
                rom_bit_counter <= rom_bit_counter + 1;
            else null;
            end if;
        end if;
    end process;


    ROM_CELL_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            rom_blocK_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_fifo = s_delay) then
                rom_blocK_counter <= 0;
            elsif(ps_fifo = s_load and rom_bit_counter = x"F") then
                rom_blocK_counter <= rom_block_counter + 1;
            end if;
        end if;
    end process;


    CWORD_BIT_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            data_bit_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_fifo = s_delay) then
                data_bit_counter <= 0;
            elsif(ps_fifo = s_load) then
                if(data_bit_counter = g_data_width-1) then
                    data_bit_counter <= 0;
                else
                    data_bit_counter <= data_bit_counter + 1;
                end if;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;