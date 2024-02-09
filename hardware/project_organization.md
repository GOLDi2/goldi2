# Project Organization:

## Development structure: [C]

- (0) Test board
  - [1]: TMC2660 driver  
  - [2]: Memory units
- (1) Common code
  - [0]: Testbenches and simulations
  - [1]: General features added to libaries
  - [2]: Actuation modules
  - [3]: DSP modules
  - [4]: Communication modules
  - [5]: IO management modules
  - [6]: Memory modules
- (2) Axis Portal V1
  -[0]: Testbenches and simulations 
  -[1]: General corrections to the AP1
- (3) Axis Portal V2
  -[0]: Testbenches and simulations
  -[1]: General corrections to the AP2
- (4) -
- (5) -
- (6) Warehouse_2
  - [0]: Board construction
  - [1]: Testbenches and simulations
- (7) Mobile Control Unit {mole_v1}
  - [0]: Board construction
  - [1]: Testbenches and simulations 


## Release structure: [V]

- (0) File reorganization and base release
  - [1]: Documentation of new file and repository structure
- (1) Release of Axis Portal V1 stable version V1.00.00
  - [1]: Integration of improved memory units (Register Unit/Register Table)
  - [2]: Reorganization of file structure to simplify future board