import asyncio

from thk_crosslab.hal import HAL
import curses


clear_line = "\033[0K"
reset_color = "\033[0m"
underline = "\033[4m"
blue = "\033[94m"
red = "\033[91m"

signal_rows = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
]

signal_cols = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
]


class CursesIO:
    def __init__(self, hal: HAL):
        self.hal = hal
        self.stdscr = curses.initscr()
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_WHITE, -1)
        curses.init_pair(2, curses.COLOR_RED, -1)
        curses.init_pair(3, curses.COLOR_BLUE, -1)
        curses.noecho()
        curses.cbreak()
        self.stdscr.nodelay(True)
        self.stdscr.keypad(True)
        self.stdscr.addstr(0, 0, "Crosslab IO Board")

        self.y_sel = 0
        self.x_sel = 0

        for i, name in enumerate(signal_cols):
            self.stdscr.addstr(2, i * 5 + 4, name)

        for i, name in enumerate(signal_rows):
            self.stdscr.addstr(i * 2 + 4, 0, name)

    def __del__(self):
        curses.nocbreak()
        self.stdscr.keypad(False)
        curses.echo()
        curses.endwin()

    async def loop(self):
        while True:
            await asyncio.gather(asyncio.sleep(0.05), self._frame())

    async def _frame(self):
        self.stdscr.redrawwin()

        input = self.stdscr.getch()

        if input == curses.KEY_UP or input==ord('w'):
            self.y_sel = max(0, self.y_sel - 1)
        elif input == curses.KEY_DOWN or input==ord('s'):
            self.y_sel = min(len(signal_rows) - 1, self.y_sel + 1)
        elif input == curses.KEY_LEFT or input==ord('a'):
            self.x_sel = max(0, self.x_sel - 1)
        elif input == curses.KEY_RIGHT or input==ord('d'):
            self.x_sel = min(len(signal_cols) - 1, self.x_sel + 1)
        elif input == ord(' '):
            self.hal.toggleVirtualSignal(signal_rows[self.y_sel] + signal_cols[self.x_sel])
        elif input != -1:
            self.stdscr.addstr(0,16,"Unknown key: {}".format(input))

        for y, row in enumerate(signal_rows):
            for x, col in enumerate(signal_cols):
                short = {
                    "highZ": "Z",
                    "strongH": "H",
                    "strongL": "L",
                    "weakH": "h",
                    "weakL": "l",
                }.get(self.hal.getSignal(row + col), " ")
                attr = {
                    "highZ": curses.color_pair(1),
                    "strongH": curses.color_pair(2),
                    "strongL": curses.color_pair(3),
                    "weakH": curses.color_pair(2),
                    "weakL": curses.color_pair(3),
                }.get(self.hal.getSignal(row + col), 0)
                if y == self.y_sel and x == self.x_sel:
                    attr = attr + curses.A_REVERSE
                self.stdscr.addstr(y * 2 + 4, x * 5 + 4, short, attr)

            # reset color
            # print(clear_line)
        self.stdscr.refresh()
