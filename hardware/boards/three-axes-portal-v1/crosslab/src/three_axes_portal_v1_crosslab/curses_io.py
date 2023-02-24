import asyncio

from three_axes_portal_v1_crosslab.hal import HAL
import curses


clear_line = "\033[0K"
reset_color = "\033[0m"
underline = "\033[4m"
blue = "\033[94m"
red = "\033[91m"

sensor_names = [
    "LimitXLeft",
    "LimitXRight",
    "LimitYBack",
    "LimitYFront",
    "LimitZBottom",
    "LimitZTop",
    "Proximity",
]
actuators_names = [
    "XMotorLeft",
    "XMotorRight",
    "YMotorBack",
    "YMotorFront",
    "ZMotorBottom",
    "ZMotorTop",
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
        self.stdscr.addstr(0, 0, "Crosslab 3 Axes Board")

        self.y_sel = 0
        self.x_sel = 0

        for i, name in enumerate(sensor_names):
            self.stdscr.addstr(2, i * 16 + 4, name)

        for i, name in enumerate(actuators_names):
            self.stdscr.addstr(5, i * 16 + 4, name)

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

        if input == curses.KEY_LEFT or input == ord("a"):
            self.x_sel = max(0, self.x_sel - 1)
        elif input == curses.KEY_RIGHT or input == ord("d"):
            self.x_sel = min(len(sensor_names) - 1, self.x_sel + 1)
        elif input == ord(" "):
            self.hal.toggleVirtualSignal(
                sensor_names[self.x_sel]
            )
        elif input != -1:
            self.stdscr.addstr(0, 16, "Unknown key: {}".format(input))

        for x, sensor in enumerate(sensor_names):
            short = {
                "highZ": "Z",
                "strongH": "H",
                "strongL": "L",
                "weakH": "h",
                "weakL": "l",
            }.get(self.hal.getSignal(sensor), " ")
            attr = {
                "highZ": curses.color_pair(1),
                "strongH": curses.color_pair(2),
                "strongL": curses.color_pair(3),
                "weakH": curses.color_pair(2),
                "weakL": curses.color_pair(3),
            }.get(self.hal.getSignal(sensor), 0)
            if x == self.x_sel:
                attr = attr + curses.A_REVERSE
            self.stdscr.addstr(3, x * 16 + 4, short, attr)

        for x, sensor in enumerate(actuators_names):
            short = {
                "highZ": "Z",
                "strongH": "H",
                "strongL": "L",
                "weakH": "h",
                "weakL": "l",
            }.get(self.hal.getSignal(sensor), " ")
            attr = {
                "highZ": curses.color_pair(1),
                "strongH": curses.color_pair(2),
                "strongL": curses.color_pair(3),
                "weakH": curses.color_pair(2),
                "weakL": curses.color_pair(3),
            }.get(self.hal.getSignal(sensor), 0)
            self.stdscr.addstr(6, x * 16 + 4, short, attr)

        self.stdscr.refresh()
