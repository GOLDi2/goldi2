-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Inter IC BUS interface - controller module
-- Module Name:		I2C_R_CONTROLLER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief
--! @details
--!
entity I2C_C_DRIVER is
    generic(
        g_scl_factor    :   natural := 480                      --! SCL signal period as a multiple of the system clock
    );
    port(
        --General
        clk             : in    std_logic;                      --! System clock
        rst             : in    std_logic;                      --! Asynchronous reset
        --Parallel data interface
        p_tdword_tready : out   std_logic;                      --! Transmission data port - ready flag
        p_tdword_tvalid : in    std_logic;                      --! Transmission data port - valid flag
        p_tdword_start  : in    std_logic;                      --! Transmission data port - address word tag
        p_tdword_stop   : in    std_logic;                      --! Transmission data port - last data word tag
        p_tdword_tdata  : in    std_logic_vector(7 downto 0);   --! Transmission data port - data
        p_tdword_error  : out   std_logic;                      --! Transmission error encountered (NACK)
        p_rdword_tready : in    std_logic;                      --! Reciver data port - ready flag
        p_rdword_tvalid : out   std_logic;                      --! Reciver data port - valid flag
        p_rdword_tdata  : out   std_logic_vector(7 downto 0);   --! Reciver data port - data
        --I2C interface
        p_i2c_scl_o     : out   std_logic;                      --! I2C serial clock - output signal
        p_i2c_sda_i     : in    std_logic;                      --! I2C serial data - input signal
        p_i2c_sda_o     : out   std_logic                       --! I2C serial data - output signal
    );
end entity I2C_C_DRIVER;




--! General architecture
architecture RTL of I2C_C_DRIVER is

    --****INTERNAL SIGNALS****
    --Data buffers
    signal tdword_data_buffer   :   std_logic_vector(7 downto 0);
    signal rdword_data_buffer   :   std_logic_vector(7 downto 0);
    signal tdword_wr_buffer     :   std_logic;
    signal i2c_g_sda_o          :   std_logic;
    signal i2c_r_sda_o          :   std_logic;
    signal i2c_t_sda_o          :   std_logic;
    --Flags
    signal rdword_tvalid_i      :   std_logic;
    signal tdword_tready_i      :   std_logic;
    signal tdword_error_i       :   std_logic;
    signal i2c_scl_i            :   std_logic;
    signal i2c_t_enb            :   std_logic;
    signal i2c_r_enb            :   std_logic;

    signal i2c_t_valid          :   std_logic;
    signal i2c_t_error          :   std_logic;
    signal i2c_r_valid          :   std_logic;
    --Counter
    signal i2c_clk_counter      :   integer range 0 to g_scl_factor;
    --State machine
    type i2c_state is (s_idle, s_start, s_address, s_hold, s_start_setup, s_thold, s_rhold, s_tstop, s_rstop, s_stop_setup, s_stop);
    signal ps_i2c   :   i2c_state;
    

begin

    --****STATE MACHINE****
    -------------------------------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk,rst)
    begin
        if(rst = '1') then
            ps_i2c <= s_idle;

        elsif(rising_edge(clk)) then
            case ps_i2c is
            when s_idle => --Idle state holds for a "start" tagged data word to be transfered
                if(p_tdword_tvalid = '1' and p_tdword_start = '1') then ps_i2c <= s_start;
                else ps_i2c <= s_idle;
                end if;

            when s_start => --Generate a starting condition by driving sda low while scl is high
                if(i2c_clk_counter = g_scl_factor-1) then ps_i2c <= s_address;
                else ps_i2c <= s_start;
                end if;

            when s_address => --Transmit the address word to select slave
                if(i2c_clk_counter = g_scl_factor-1 and i2c_t_valid = '1') then ps_i2c <= s_hold;
                elsif(i2c_clk_counter = g_scl_factor-1 and i2c_t_error = '1') then ps_i2c <= s_idle;
                else ps_i2c <= s_address;
                end if;

            when s_hold => --Wait for next data word to process
                if(p_tdword_tvalid = '1' and p_tdword_start = '1') then ps_i2c <= s_start_setup;
                elsif(p_tdword_tvalid = '1' and p_tdword_stop = '1' and tdword_wr_buffer = '1') then ps_i2c <= s_rstop;
                elsif(p_tdword_tvalid = '1' and p_tdword_stop = '1' and tdword_wr_buffer = '0') then ps_i2c <= s_tstop;
                elsif(p_tdword_tvalid = '1' and tdword_wr_buffer = '1') then ps_i2c <= s_rhold;
                elsif(p_tdword_tvalid = '1' and tdword_wr_buffer = '0') then ps_i2c <= s_thold;
                else ps_i2c <= s_hold;
                end if;

            when s_start_setup => --Hold lines to prepare for a new start condition
                if(i2c_clk_counter = g_scl_factor-1) then ps_i2c <= s_start;
                else ps_i2c <= s_start_setup;
                end if;
            
            when s_thold => --Transmit data word and return to hold state to wait for next data word
                if(i2c_clk_counter = g_scl_factor-1 and i2c_t_valid = '1') then ps_i2c <= s_hold;
                elsif(i2c_clk_counter = g_scl_factor-1 and i2c_t_error = '1') then ps_i2c <= s_idle;
                else ps_i2c <= s_thold;
                end if;

            when s_rhold => --Recive data and return to hold state
                if(i2c_clk_counter = g_scl_factor-1 and i2c_r_valid = '1') then ps_i2c <= s_hold;
                else ps_i2c <= s_rhold;
                end if;

            when s_tstop => --Transmit data word and initate stop condition
                if(i2c_clk_counter = g_scl_factor-1 and i2c_t_valid = '1') then ps_i2c <= s_stop_setup;
                elsif(i2c_clk_counter = g_scl_factor-1 and i2c_t_error = '1') then ps_i2c <= s_idle;
                else ps_i2c <= s_tstop;
                end if;

            when s_rstop => --Recive data word and initiate stop condition
                if(i2c_clk_counter = g_scl_factor-1 and i2c_r_valid = '1') then ps_i2c <= s_stop_setup;
                else ps_i2c <= s_rhold;
                end if;

            when s_stop_setup => 
                if(i2c_clk_counter = g_scl_factor-1) then ps_i2c <= s_stop;
                else ps_i2c <= s_stop_setup;
                end if;

            when s_stop =>
                if(i2c_clk_counter = g_scl_factor-1) then ps_i2c <= s_idle;
                else ps_i2c <= s_stop;
                end if;

            when others => ps_i2c <= s_idle;
            end case;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****PARALLEL INTERFACE****
    -------------------------------------------------------------------------------------------------------------------
    INPUT_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            tdword_data_buffer <= (others => '0');
            tdword_wr_buffer   <= '1';
        elsif(rising_edge(clk)) then
            if(tdword_tready_i = '1' and p_tdword_start = '1' and p_tdword_tvalid = '1') then
                tdword_data_buffer <= p_tdword_tdata;
                tdword_wr_buffer   <= p_tdword_tdata(0);
            elsif(tdword_tready_i = '1' and p_tdword_tvalid = '1') then
                tdword_data_buffer <= p_tdword_tdata;
            end if;
        end if;
    end process;
    

    INPUT_READY_FLAG : process(rst, ps_i2c)
    begin
        if(rst = '1') then
            tdword_tready_i <= '0';
        elsif(ps_i2c = s_idle or ps_i2c = s_hold) then
            tdword_tready_i <= '1';
        else
            tdword_tready_i <= '0';
        end if;
    end process;

    --Route flag to the outside of the module
    p_tdword_tready <= tdword_tready_i;



    OUTPUT_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_rdword_tdata <= (others => '0');
        elsif(rising_edge(clk)) then
            if(i2c_r_valid = '1' and i2c_clk_counter = g_scl_factor-1) then
                p_rdword_tdata <= rdword_data_buffer;
            end if;
        end if;
    end process;


    OUTPUT_VALID_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            rdword_tvalid_i <= '0';
        elsif(rising_edge(clk)) then
            if(i2c_r_valid = '1' and i2c_clk_counter = g_scl_factor-1) then
                rdword_tvalid_i <= '1';
            elsif(rdword_tvalid_i = '1' and p_rdword_tready = '1') then
                rdword_tvalid_i <= '0';
            end if;       
        end if;
    end process;

    --Route falg to the outside of the module
    p_rdword_tvalid <= rdword_tvalid_i;



    ERROR_FLAG_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            tdword_error_i <= '0';
        elsif(rising_edge(clk)) then
            if(ps_i2c = s_start) then
                tdword_error_i <= '0';
            elsif(i2c_t_error = '1' and i2c_clk_counter = g_scl_factor-1) then
                tdword_error_i <= '1';
            end if;
        end if;
    end process;

    --Route flag to the outside of the module
    p_tdword_error <= tdword_error_i;
    -------------------------------------------------------------------------------------------------------------------



    --****I2C INTERFACE****
    -------------------------------------------------------------------------------------------------------------------    
    SCL_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            i2c_scl_i <= '1';
        elsif(rising_edge(clk)) then
            if(ps_i2c = s_idle or ps_i2c = s_start or ps_i2c = s_stop) then
                i2c_scl_i <= '1';
            elsif(ps_i2c = s_hold or ps_i2c = s_start_setup or ps_i2c = s_stop_setup) then
                i2c_scl_i <= '0';
            elsif(i2c_clk_counter < g_scl_factor/2) then
                i2c_scl_i <= '0';
            else
                i2c_scl_i <= '1';
            end if;
        end if;
    end process;

    --Route clock signal to the outside of the module
    p_i2c_scl_o <= i2c_scl_i;



    SDA_GENREAL_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            i2c_g_sda_o <= '1';
        elsif(rising_edge(clk)) then
            if(ps_i2c = s_idle or ps_i2c = s_start_setup) then
                i2c_g_sda_o <= '1';
            elsif(ps_i2c = s_start and i2c_clk_counter < g_scl_factor/2) then
                i2c_g_sda_o <= '1';
            elsif(ps_i2c = s_start) then
                i2c_g_sda_o <= '0';
            elsif(ps_i2c = s_stop and i2c_clk_counter < g_scl_factor/2) then
                i2c_g_sda_o <= '0';
            elsif(ps_i2c = s_stop) then
                i2c_g_sda_o <= '1';
            else
                i2c_g_sda_o <= '0';
            end if;
        end if;
    end process;

    --Multiplex the sda_out signal depending on the state machine
    -- MUX_SDA_O : process(clk,rst)
    -- begin
    --     if(rst = '1') then
    --         p_i2c_sda_o <= '1';
    --     elsif(rising_edge(clk)) then
    --         if(ps_i2c = s_address or ps_i2c = s_thold or ps_i2c = s_tstop) then
    --             p_i2c_sda_o <= i2c_t_sda_o;
    --         elsif(ps_i2c = s_rhold or ps_i2c = s_rstop) then
    --             p_i2c_sda_o <= i2c_r_sda_o;
    --         else
    --             p_i2c_sda_o <= i2c_g_sda_o;
    --         end if;
    --     end if;
    -- end process;

    p_i2c_sda_o <= i2c_t_sda_o when(ps_i2c = s_address or ps_i2c = s_thold or ps_i2c = s_tstop) else
                   i2c_r_sda_o when(ps_i2c = s_rhold or ps_i2c = s_rstop)                       else
                   i2c_g_sda_o;
    -------------------------------------------------------------------------------------------------------------------



    --****I2C TRANSFER CONTROL****
    -------------------------------------------------------------------------------------------------------------------
    --Enable module to transmit the address and data words
    i2c_t_enb <= '1' when(ps_i2c = s_address or ps_i2c = s_thold or ps_i2c = s_tstop) else '0';

    I2C_TRANSMITTER : entity work.I2C_T_CONTROLLER
    port map(
        clk         => clk,
        rst         => rst,
        enb         => i2c_t_enb,
        p_t_data    => tdword_data_buffer,
        p_t_valid   => i2c_t_valid,
        p_t_error   => i2c_t_error,
        p_i2c_scl   => i2c_scl_i,
        p_i2c_sda_i => p_i2c_sda_i,
        p_i2c_sda_o => i2c_t_sda_o
    );


    --Enable module to recive data words
    i2c_r_enb <= '1' when(ps_i2c = s_rhold or ps_i2c = s_rstop) else '0';

    I2C_RECIVER : entity work.I2C_R_CONTROLLER
    port map(
        clk         => clk,
        rst         => rst,
        enb         => i2c_r_enb,
        p_t_data    => rdword_data_buffer,
        p_t_valid   => i2c_r_valid,
        p_i2c_scl   => i2c_scl_i,
        p_i2c_sda_i => p_i2c_sda_i,
        p_i2c_sda_o => i2c_r_sda_o
    );
    -------------------------------------------------------------------------------------------------------------------


    
    --****COUNTER****
    -------------------------------------------------------------------------------------------------------------------
    CLOCK_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            i2c_clk_counter <= 0;

        elsif(rising_edge(clk)) then
            if(ps_i2c = s_idle or ps_i2c = s_hold) then
                i2c_clk_counter <= 0;
            elsif(i2c_clk_counter = g_scl_factor-1) then
                i2c_clk_counter <= 0;
            else
                i2c_clk_counter <= i2c_clk_counter + 1;
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------


end architecture;