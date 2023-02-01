# GOLDi2 Monorepo

## Subprojects

### Dependencies

[//]: # (Dependencies)

```mermaid
graph LR
%%{init:{'flowchart':{'nodeSpacing': 20, 'rankSpacing': 80, 'curve': 'linear', 'useMaxWidth': false}}}%%
  subgraph clients/api/python
    clients/api/python:build[build]
  end
  subgraph clients/soa/python
    clients/soa/python:build[build]
    clients/soa/python:lint[lint]
    clients/soa/python:test[test]
  end
  subgraph helper/openapi-codegeneration
    helper/openapi-codegeneration:build[build]
  end
  subgraph services/auth
    services/auth:build-spec[build-spec]
  end
  subgraph services/booking
    services/booking:build-spec[build-spec]
  end
  subgraph services/device
    services/device:build-spec[build-spec]
  end
  subgraph services/experiment
    services/experiment:build-spec[build-spec]
  end
  subgraph services/federation
    services/federation:build-spec[build-spec]
  end
  subgraph services/openapi
    services/openapi:build-spec[build-spec]
  end
  subgraph services/update
    services/update:build-spec[build-spec]
  end
  services/openapi:build-spec[build-spec] --> clients/api/python:build[build]
  helper/openapi-codegeneration:build[build] --> clients/api/python:build[build]
  services/openapi:build-spec[build-spec] --> clients/soa/python:build[build]
  helper/openapi-codegeneration:build[build] --> clients/soa/python:build[build]
  clients/api/python:build[build] --> clients/soa/python:build[build]
  clients/soa/python:build[build] --> clients/soa/python:lint[lint]
  clients/soa/python:build[build] --> clients/soa/python:test[test]
  services/auth:build-spec[build-spec] --> services/openapi:build-spec[build-spec]
  services/booking:build-spec[build-spec] --> services/openapi:build-spec[build-spec]
  services/device:build-spec[build-spec] --> services/openapi:build-spec[build-spec]
  services/experiment:build-spec[build-spec] --> services/openapi:build-spec[build-spec]
  services/federation:build-spec[build-spec] --> services/openapi:build-spec[build-spec]
  services/update:build-spec[build-spec] --> services/openapi:build-spec[build-spec]
```

### Backend Services

| Name       | build-spec                                                                                               | linting                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| auth       | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_auth-build-spec.svg)       | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_auth-lint.svg)       |
| booking    | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_booking-build-spec.svg)    | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_booking-lint.svg)    |
| device     | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_device-build-spec.svg)     | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_device-lint.svg)     |
| experiment | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_experiment-build-spec.svg) | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_experiment-lint.svg) |
| federation | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_federation-build-spec.svg) | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_federation-lint.svg) |
| update     | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_update-build-spec.svg)     | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_update-lint.svg)     |
| openapi    | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_openapi-build-spec.svg)    | ![build-spec](https://x56.theoinf.tu-ilmenau.de/badges/badge_backend-services_openapi-lint.svg)    |

### Clients

| Name             | build                                                                                 | lint                                                                                | test                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| api (javascript) | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_api_js-build.svg)     | ![lint](https://img.shields.io/badge/lint-unavailable-inactive?style=flat-square)   | ![test](https://img.shields.io/badge/test-unavailable-inactive?style=flat-square)   |
| api (python)     | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_api_python-build.svg) | ![lint](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_api_python-lint.svg) | ![test](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_api_python-test.svg) |
| soa (javascript) | ![build](https://img.shields.io/badge/build-unavailable-inactive?style=flat-square)   | ![lint](https://img.shields.io/badge/lint-unavailable-inactive?style=flat-square)   | ![test](https://img.shields.io/badge/test-unavailable-inactive?style=flat-square)   |
| soa (python)     | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_soa_python-build.svg) | ![lint](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_soa_python-lint.svg) | ![test](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_soa_python-test.svg) |

#### SOA Services

| Name                           | build                                                                                                              | lint                                                                                                             | test                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Electrical Connection (python) | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_soa_services_electricalConnection_python-build.svg) | ![lint](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_soa_services_electricalConnection_python-lint.svg) | ![test](https://x56.theoinf.tu-ilmenau.de/badges/badge_clients_soa_services_electricalConnection_python-test.svg) |

### Helper

| Name                      | build                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| crosslab-typescript-addon | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_helper_crosslab-typescript-addon-build.svg) |
| openapi-codegeneration    | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_helper_openapi-codegeneration-build.svg)    |
| tsdoc-theme               | ![build](https://x56.theoinf.tu-ilmenau.de/badges/badge_helper_tsdoc-theme-build.svg)               |
