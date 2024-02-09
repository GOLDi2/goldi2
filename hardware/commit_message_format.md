# Commit message format:

Commit message format used in hardware_development branch:

    <Version> - <type>(<scope>): <Description>
    <body>
    <footer>




## Version format for stable code:

Version: V#a.#b.#c

+ #a: Current stabel release version used or beeing modified (1-digit)
+ #b: Feature number assigned to new elements (2-digits)
+ #c: Fix number assigned to corrected code (2-digits)




## Version format for development code

Version: C#a.#b.#c

+ #a: Common/Board number of change's location (2-digits)
+ #b: Feature number assigned to new element (2-digits)
+ #c: Commit number (2-digits)




## Comit Description
### Type:

- build - Changes that affect the build system or 
  external dependencies (example source, simulation, scripts, etc...)
- ci    - Changes to CI configuration files and 
          scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- docs  - Documentation only changes
- feat  - A new feature
- fix   - A bug fix
- perf  - A code change that improves performance
- refactor - A code change that neither fixes a bug nor adds a feature	
- style - Changes that do not affect the meaning of the 
  code (white-space, formatting, missing semi-colons, etc)
- test  - Adding missing tests or correcting existing tests
- rep   - Changes realated to explicit changes to the repository in a section
  

### Description:

short description

*optional*: String + "-" + Description = Unit changed + Short description

### Body:

extended description


### Footer:

additional metadata (<string> ":" <string> ";")


*optional*: Error/Bug code (when bug is fixed)