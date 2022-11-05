import aiohttp
from typing import Optional

class APIClient:
    BASE_URL: str | None = None

    def __init__(self, base_url: str | None = None):
        if base_url is None:
            base_url = self.BASE_URL
        elif base_url.endswith('/'):
            base_url = base_url[:-1]
        self.BASE_URL = base_url

    async def __aenter__(self):
        self.http_session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, *err):
        await self.http_session.close()

    def postLogin(self):
        {
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "allOf": [
          {
            "title": "Credentials",
            "type": "object",
            "properties": {
              "username": {
                "type": "string"
              },
              "password": {
                "type": "string"
              }
            },
            "required": [
              "username",
              "password"
            ]
          },
          {
            "type": "object",
            "properties": {
              "method": {
                "title": "AuthMethod",
                "type": "string",
                "enum": [
                  "tui",
                  "local"
                ]
              }
            }
          }
        ]
      }
    }
  }
}
        pass

    def postLogout(self):
        {
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "description": "The token to be invalidated"
          }
        }
      }
    }
  }
}
        pass

    def postDeviceToken(self):
        
        pass

    def getUsers(self):
        
        pass

    def postUsers(self):
        {
  "description": "User to be created",
  "content": {
    "application/json": {
      "schema": {
        "title": "User",
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string",
            "writeOnly": true
          },
          "roles": {
            "type": "array",
            "items": {
              "title": "Role",
              "type": "object",
              "properties": {
                "name": {
                  "type": "string"
                },
                "scopes": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
        pass

    def getUsersByUsername(self, url: str):
        
        pass

    def patchUsersByUsername(self, url: str):
        {
  "description": "Updated user",
  "content": {
    "application/json": {
      "schema": {
        "title": "User",
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string",
            "writeOnly": true
          },
          "roles": {
            "type": "array",
            "items": {
              "title": "Role",
              "type": "object",
              "properties": {
                "name": {
                  "type": "string"
                },
                "scopes": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
        pass

    def deleteUsersByUsername(self, url: str):
        
        pass

    def putUsersByUsernameRolesByRoleName(self, url: str):
        
        pass

    def deleteUsersByUsernameRolesByRoleName(self, url: str):
        
        pass

    def getIdentity(self):
        
        pass

    def patchIdentity(self):
        {
  "description": "Updated identity",
  "content": {
    "application/json": {
      "schema": {
        "title": "User",
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string",
            "writeOnly": true
          },
          "roles": {
            "type": "array",
            "items": {
              "title": "Role",
              "type": "object",
              "properties": {
                "name": {
                  "type": "string"
                },
                "scopes": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
        pass

    def postSchedule(self):
        {
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "required": [
          "Experiment",
          "Time"
        ],
        "properties": {
          "Experiment": {
            "description": "An experiment describes a set of devices and how they should be connected (potentially among other metadata).",
            "type": "object",
            "required": [
              "Devices"
            ],
            "properties": {
              "Devices": {
                "type": "array",
                "description": "List of devices used in experiment.",
                "items": {
                  "description": "A device might either be a physical/virtual device or a group of device.",
                  "type": "object",
                  "required": [
                    "ID"
                  ],
                  "properties": {
                    "ID": {
                      "type": "string",
                      "description": "Unique ID of the device. Contains the institution (by having an end point at that institution)",
                      "format": "uri"
                    }
                  }
                }
              },
              "Description": {
                "type": "string",
                "description": "User provided description, for example might be a reason for the booking (e.g. maintenance) or a link to the experiment. Might be empty or missing."
              }
            }
          },
          "Time": {
            "description": "A time slot represents a slice of time used for bookings.",
            "type": "object",
            "required": [
              "Start",
              "End"
            ],
            "properties": {
              "Start": {
                "type": "string",
                "description": "Start time of the booking.",
                "format": "date-time"
              },
              "End": {
                "type": "string",
                "description": "End time of the booking.",
                "format": "date-time"
              }
            }
          },
          "Combined": {
            "type": "boolean",
            "description": "If true, show only one timetable per device instead of one for all available physical devices."
          },
          "onlyOwn": {
            "type": "boolean",
            "description": "(private) Show only devices of this institution. Give an error if a device of an other institution is requested."
          }
        }
      }
    }
  }
}
        pass

    def putBooking(self):
        {
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "required": [
          "Experiment",
          "Time"
        ],
        "properties": {
          "Experiment": {
            "description": "An experiment describes a set of devices and how they should be connected (potentially among other metadata).",
            "type": "object",
            "required": [
              "Devices"
            ],
            "properties": {
              "Devices": {
                "type": "array",
                "description": "List of devices used in experiment.",
                "items": {
                  "description": "A device might either be a physical/virtual device or a group of device.",
                  "type": "object",
                  "required": [
                    "ID"
                  ],
                  "properties": {
                    "ID": {
                      "type": "string",
                      "description": "Unique ID of the device. Contains the institution (by having an end point at that institution)",
                      "format": "uri"
                    }
                  }
                }
              },
              "Description": {
                "type": "string",
                "description": "User provided description, for example might be a reason for the booking (e.g. maintenance) or a link to the experiment. Might be empty or missing."
              }
            }
          },
          "Time": {
            "description": "A time slot represents a slice of time used for bookings.",
            "type": "object",
            "required": [
              "Start",
              "End"
            ],
            "properties": {
              "Start": {
                "type": "string",
                "description": "Start time of the booking.",
                "format": "date-time"
              },
              "End": {
                "type": "string",
                "description": "End time of the booking.",
                "format": "date-time"
              }
            }
          },
          "Type": {
            "description": "Type of booking. Currently, only one type is defined, but others might follow (e.g. priority booking). If empty, 'normal' is assumed.",
            "type": "string",
            "enum": [
              "normal"
            ]
          }
        }
      }
    }
  }
}
        pass

    def patchBookingByID(self, url: str):
        {
  "content": {
    "application/json": {
      "schema": {
        "anyOf": [
          {
            "type": "object",
            "description": "Use this request for adding devices.",
            "properties": {
              "Locked": {
                "type": "boolean",
                "description": "Expresses whether the devices should be locked. Must match current status of booking."
              },
              "Devices": {
                "type": "array",
                "description": "List of devices which should be added.",
                "items": {
                  "description": "A device might either be a physical/virtual device or a group of device.",
                  "type": "object",
                  "required": [
                    "ID"
                  ],
                  "properties": {
                    "ID": {
                      "type": "string",
                      "description": "Unique ID of the device. Contains the institution (by having an end point at that institution)",
                      "format": "uri"
                    }
                  }
                }
              }
            }
          },
          {
            "type": "object",
            "description": "Use this request for adding callbacks.",
            "properties": {
              "Callback": {
                "type": "string",
                "format": "uri",
                "description": "Callback which should be called at changes."
              }
            }
          }
        ]
      }
    }
  },
  "required": true
}
        pass

    def deleteBookingByID(self, url: str):
        
        pass

    def getBookingByID(self, url: str):
        
        pass

    def deleteBookingByIDDestroy(self, url: str):
        
        pass

    def putBookingByIDLock(self, url: str):
        
        pass

    def deleteBookingByIDLock(self, url: str):
        
        pass

    def postBookingCallbackByID(self, url: str):
        
        pass

    def getDevices(self):
        
        pass

    def postDevices(self, changedUrl: Optional[str] = None):
        {
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "anyOf": [
          {
            "allOf": [
              {
                "title": "Concrete Device",
                "allOf": [
                  {
                    "title": "Device Overview",
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "string",
                        "description": "URL of the device",
                        "format": "uri",
                        "readOnly": true
                      },
                      "name": {
                        "type": "string",
                        "description": "Name of the device"
                      },
                      "description": {
                        "type": "string",
                        "description": "Extended description of the device, features, etc."
                      },
                      "type": {
                        "type": "string",
                        "description": "Type of the device",
                        "enum": [
                          "device",
                          "group",
                          "virtual"
                        ]
                      },
                      "owner": {
                        "type": "string",
                        "format": "uri"
                      }
                    }
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "device"
                      },
                      "connected": {
                        "description": "If true, the device is connected to the service and can be used.\n",
                        "type": "boolean"
                      },
                      "announcedAvailability": {
                        "title": "Availability",
                        "description": "A list of time slots that the maintainer of the device announced it is available\n",
                        "type": "array",
                        "items": {
                          "title": "Time Slot",
                          "type": "object",
                          "properties": {
                            "start": {
                              "type": "string",
                              "format": "date-time"
                            },
                            "end": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        }
                      },
                      "experiment": {
                        "type": "string",
                        "format": "uri"
                      },
                      "services": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": true
                        }
                      }
                    }
                  }
                ]
              },
              {
                "type": "object",
                "properties": {
                  "announcedAvailability": {
                    "type": "array",
                    "items": {
                      "title": "Availability Rule",
                      "type": "object",
                      "allOf": [
                        {
                          "title": "Time Slot",
                          "type": "object",
                          "properties": {
                            "start": {
                              "type": "string",
                              "format": "date-time"
                            },
                            "end": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        },
                        {
                          "properties": {
                            "available": {
                              "type": "boolean"
                            },
                            "repeat": {
                              "description": "If specified the time slot is repeated in a fixed offset specified by the frequency",
                              "type": "object",
                              "properties": {
                                "frequency": {
                                  "type": "string",
                                  "enum": [
                                    "HOURLY",
                                    "DAILY",
                                    "WEEKLY",
                                    "MONTHLY",
                                    "YEARLY"
                                  ]
                                },
                                "until": {
                                  "description": "Up to this date-time the time slot will be repeated.",
                                  "type": "string",
                                  "format": "date-time"
                                },
                                "count": {
                                  "description": "How often the time slot will be repeated",
                                  "type": "integer"
                                }
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            ]
          },
          {
            "title": "Device Group",
            "allOf": [
              {
                "title": "Device Overview",
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL of the device",
                    "format": "uri",
                    "readOnly": true
                  },
                  "name": {
                    "type": "string",
                    "description": "Name of the device"
                  },
                  "description": {
                    "type": "string",
                    "description": "Extended description of the device, features, etc."
                  },
                  "type": {
                    "type": "string",
                    "description": "Type of the device",
                    "enum": [
                      "device",
                      "group",
                      "virtual"
                    ]
                  },
                  "owner": {
                    "type": "string",
                    "format": "uri"
                  }
                }
              },
              {
                "type": "object",
                "properties": {
                  "type": {
                    "const": "group"
                  },
                  "devices": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "url": {
                          "type": "string",
                          "description": "URL of the device",
                          "format": "uri"
                        }
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            "title": "Virtual Device",
            "allOf": [
              {
                "title": "Device Overview",
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL of the device",
                    "format": "uri",
                    "readOnly": true
                  },
                  "name": {
                    "type": "string",
                    "description": "Name of the device"
                  },
                  "description": {
                    "type": "string",
                    "description": "Extended description of the device, features, etc."
                  },
                  "type": {
                    "type": "string",
                    "description": "Type of the device",
                    "enum": [
                      "device",
                      "group",
                      "virtual"
                    ]
                  },
                  "owner": {
                    "type": "string",
                    "format": "uri"
                  }
                }
              },
              {
                "type": "object",
                "properties": {
                  "type": {
                    "const": "virtual"
                  }
                }
              }
            ]
          }
        ]
      },
      "examples": {
        "microcontroller": {
          "value": {
            "name": "ATmega328P",
            "description": "8-bit AVR Microcontroller with 32K Bytes In-System Programmable Flash",
            "owner": "https://api.example.com/groups/goldi",
            "type": "device",
            "services": [
              {
                "serviceType": "https://api.example.com/services/electrical",
                "serviceId": "pins",
                "serviceDirection": "prosumer",
                "interfaces": [
                  {
                    "interfaceType": "gpio",
                    "availableSignals": {
                      "gpio": [
                        "PB0",
                        "PB1",
                        "PB2",
                        "PB3",
                        "PB4",
                        "PB5",
                        "PB6",
                        "PB7",
                        "PC0",
                        "PC1",
                        "PC2",
                        "PC3",
                        "PC4",
                        "PC5",
                        "PC6",
                        "PD0",
                        "PD1",
                        "PD2",
                        "PD3",
                        "PD4",
                        "PD5",
                        "PD6",
                        "PD7"
                      ]
                    }
                  },
                  {
                    "interfaceType": "i2c",
                    "availableSignals": {
                      "sda": [
                        "PC4"
                      ],
                      "scl": [
                        "PC5"
                      ]
                    }
                  },
                  {
                    "interfaceType": "spi",
                    "roles": [
                      "master",
                      "slave"
                    ],
                    "availableSignals": {
                      "miso": [
                        "PB4"
                      ],
                      "mosi": [
                        "PB3"
                      ],
                      "sck": [
                        "PB5"
                      ],
                      "ss-slave": [
                        "PB2"
                      ],
                      "ss-master": [
                        "PB0",
                        "PB1",
                        "PB2",
                        "PB6",
                        "PB7",
                        "PC0",
                        "PC1",
                        "PC2",
                        "PC3",
                        "PC4",
                        "PC5",
                        "PC6",
                        "PD0",
                        "PD1",
                        "PD2",
                        "PD3",
                        "PD4",
                        "PD5",
                        "PD6",
                        "PD7"
                      ]
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }
  }
}
        pass

    def getDevicesByDeviceId(self, url: str, flat_group: Optional[bool] = None):
        
        pass

    def patchDevicesByDeviceId(self, url: str, changedUrl: Optional[str] = None):
        {
  "description": "Update the device",
  "content": {
    "application/json": {
      "schema": {
        "anyOf": [
          {
            "allOf": [
              {
                "title": "Concrete Device",
                "allOf": [
                  {
                    "title": "Device Overview",
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "string",
                        "description": "URL of the device",
                        "format": "uri",
                        "readOnly": true
                      },
                      "name": {
                        "type": "string",
                        "description": "Name of the device"
                      },
                      "description": {
                        "type": "string",
                        "description": "Extended description of the device, features, etc."
                      },
                      "type": {
                        "type": "string",
                        "description": "Type of the device",
                        "enum": [
                          "device",
                          "group",
                          "virtual"
                        ]
                      },
                      "owner": {
                        "type": "string",
                        "format": "uri"
                      }
                    }
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "device"
                      },
                      "connected": {
                        "description": "If true, the device is connected to the service and can be used.\n",
                        "type": "boolean"
                      },
                      "announcedAvailability": {
                        "title": "Availability",
                        "description": "A list of time slots that the maintainer of the device announced it is available\n",
                        "type": "array",
                        "items": {
                          "title": "Time Slot",
                          "type": "object",
                          "properties": {
                            "start": {
                              "type": "string",
                              "format": "date-time"
                            },
                            "end": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        }
                      },
                      "experiment": {
                        "type": "string",
                        "format": "uri"
                      },
                      "services": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": true
                        }
                      }
                    }
                  }
                ]
              },
              {
                "type": "object",
                "properties": {
                  "announcedAvailability": {
                    "type": "array",
                    "items": {
                      "title": "Availability Rule",
                      "type": "object",
                      "allOf": [
                        {
                          "title": "Time Slot",
                          "type": "object",
                          "properties": {
                            "start": {
                              "type": "string",
                              "format": "date-time"
                            },
                            "end": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        },
                        {
                          "properties": {
                            "available": {
                              "type": "boolean"
                            },
                            "repeat": {
                              "description": "If specified the time slot is repeated in a fixed offset specified by the frequency",
                              "type": "object",
                              "properties": {
                                "frequency": {
                                  "type": "string",
                                  "enum": [
                                    "HOURLY",
                                    "DAILY",
                                    "WEEKLY",
                                    "MONTHLY",
                                    "YEARLY"
                                  ]
                                },
                                "until": {
                                  "description": "Up to this date-time the time slot will be repeated.",
                                  "type": "string",
                                  "format": "date-time"
                                },
                                "count": {
                                  "description": "How often the time slot will be repeated",
                                  "type": "integer"
                                }
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            ]
          },
          {
            "title": "Device Group",
            "allOf": [
              {
                "title": "Device Overview",
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL of the device",
                    "format": "uri",
                    "readOnly": true
                  },
                  "name": {
                    "type": "string",
                    "description": "Name of the device"
                  },
                  "description": {
                    "type": "string",
                    "description": "Extended description of the device, features, etc."
                  },
                  "type": {
                    "type": "string",
                    "description": "Type of the device",
                    "enum": [
                      "device",
                      "group",
                      "virtual"
                    ]
                  },
                  "owner": {
                    "type": "string",
                    "format": "uri"
                  }
                }
              },
              {
                "type": "object",
                "properties": {
                  "type": {
                    "const": "group"
                  },
                  "devices": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "url": {
                          "type": "string",
                          "description": "URL of the device",
                          "format": "uri"
                        }
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            "title": "Virtual Device",
            "allOf": [
              {
                "title": "Device Overview",
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL of the device",
                    "format": "uri",
                    "readOnly": true
                  },
                  "name": {
                    "type": "string",
                    "description": "Name of the device"
                  },
                  "description": {
                    "type": "string",
                    "description": "Extended description of the device, features, etc."
                  },
                  "type": {
                    "type": "string",
                    "description": "Type of the device",
                    "enum": [
                      "device",
                      "group",
                      "virtual"
                    ]
                  },
                  "owner": {
                    "type": "string",
                    "format": "uri"
                  }
                }
              },
              {
                "type": "object",
                "properties": {
                  "type": {
                    "const": "virtual"
                  }
                }
              }
            ]
          }
        ]
      },
      "examples": {
        "microcontroller": {
          "value": {
            "name": "ATmega328P",
            "description": "8-bit AVR Microcontroller with 32K Bytes In-System Programmable Flash",
            "owner": "https://api.example.com/groups/goldi",
            "type": "device",
            "services": [
              {
                "serviceType": "https://api.example.com/services/electrical",
                "serviceId": "pins",
                "serviceDirection": "prosumer",
                "interfaces": [
                  {
                    "interfaceType": "gpio",
                    "availableSignals": {
                      "gpio": [
                        "PB0",
                        "PB1",
                        "PB2",
                        "PB3",
                        "PB4",
                        "PB5",
                        "PB6",
                        "PB7",
                        "PC0",
                        "PC1",
                        "PC2",
                        "PC3",
                        "PC4",
                        "PC5",
                        "PC6",
                        "PD0",
                        "PD1",
                        "PD2",
                        "PD3",
                        "PD4",
                        "PD5",
                        "PD6",
                        "PD7"
                      ]
                    }
                  },
                  {
                    "interfaceType": "i2c",
                    "availableSignals": {
                      "sda": [
                        "PC4"
                      ],
                      "scl": [
                        "PC5"
                      ]
                    }
                  },
                  {
                    "interfaceType": "spi",
                    "roles": [
                      "master",
                      "slave"
                    ],
                    "availableSignals": {
                      "miso": [
                        "PB4"
                      ],
                      "mosi": [
                        "PB3"
                      ],
                      "sck": [
                        "PB5"
                      ],
                      "ss-slave": [
                        "PB2"
                      ],
                      "ss-master": [
                        "PB0",
                        "PB1",
                        "PB2",
                        "PB6",
                        "PB7",
                        "PC0",
                        "PC1",
                        "PC2",
                        "PC3",
                        "PC4",
                        "PC5",
                        "PC6",
                        "PD0",
                        "PD1",
                        "PD2",
                        "PD3",
                        "PD4",
                        "PD5",
                        "PD6",
                        "PD7"
                      ]
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }
  }
}
        pass

    def deleteDevicesByDeviceId(self, url: str):
        
        pass

    def postDevicesByDeviceId(self, url: str, changedUrl: Optional[str] = None):
        
        pass

    def postDevicesByDeviceIdAvailability(self, url: str):
        {
  "content": {
    "application/json": {
      "schema": {
        "type": "array",
        "items": {
          "title": "Availability Rule",
          "type": "object",
          "allOf": [
            {
              "title": "Time Slot",
              "type": "object",
              "properties": {
                "start": {
                  "type": "string",
                  "format": "date-time"
                },
                "end": {
                  "type": "string",
                  "format": "date-time"
                }
              }
            },
            {
              "properties": {
                "available": {
                  "type": "boolean"
                },
                "repeat": {
                  "description": "If specified the time slot is repeated in a fixed offset specified by the frequency",
                  "type": "object",
                  "properties": {
                    "frequency": {
                      "type": "string",
                      "enum": [
                        "HOURLY",
                        "DAILY",
                        "WEEKLY",
                        "MONTHLY",
                        "YEARLY"
                      ]
                    },
                    "until": {
                      "description": "Up to this date-time the time slot will be repeated.",
                      "type": "string",
                      "format": "date-time"
                    },
                    "count": {
                      "description": "How often the time slot will be repeated",
                      "type": "integer"
                    }
                  }
                }
              }
            }
          ]
        }
      },
      "examples": {
        "Make the device always unavailable": {
          "value": [
            {
              "available": false
            }
          ]
        },
        "Make the device always available": {
          "value": [
            {
              "available": true
            }
          ]
        },
        "Make the device only available from monday 9:00 through friday 17:00": {
          "value": [
            {
              "available": true,
              "start": "2022-05-15T09:00:00Z",
              "end": "2022-05-20T17:00:00Z",
              "repeat": {
                "frequency": "WEEKLY"
              }
            },
            {
              "available": false,
              "start": "2022-05-20T17:00:00Z",
              "end": "2022-05-23T09:00:00Z",
              "repeat": {
                "frequency": "WEEKLY"
              }
            }
          ]
        }
      }
    }
  }
}
        pass

    def postDevicesByDeviceIdToken(self, url: str):
        
        pass

    def postDevicesByDeviceIdSignaling(self, url: str, peerconnection_url: str):
        {
  "content": {
    "application/json": {
      "schema": {
        "anyOf": [
          {
            "title": "Create Peerconnection Message",
            "allOf": [
              {
                "title": "Command Message",
                "allOf": [
                  {
                    "title": "Message",
                    "type": "object",
                    "properties": {
                      "messageType": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "messageType"
                    ],
                    "additionalProperties": true,
                    "x-typeguard": true
                  },
                  {
                    "type": "object",
                    "properties": {
                      "messageType": {
                        "const": "command"
                      },
                      "command": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "messageType",
                      "command"
                    ]
                  }
                ],
                "x-typeguard": true
              },
              {
                "type": "object",
                "properties": {
                  "command": {
                    "const": "createPeerconnection"
                  },
                  "connectionType": {
                    "type": "string",
                    "enum": [
                      "webrtc",
                      "websocket"
                    ]
                  },
                  "connectionUrl": {
                    "type": "string",
                    "format": "uri"
                  },
                  "services": {
                    "type": "array",
                    "items": {
                      "title": "Service Config",
                      "type": "object",
                      "properties": {
                        "serviceType": {
                          "type": "string",
                          "format": "uri"
                        },
                        "serviceId": {
                          "type": "string"
                        },
                        "remoteServiceId": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": true
                    }
                  },
                  "tiebreaker": {
                    "type": "boolean"
                  }
                },
                "required": [
                  "command",
                  "connectionType",
                  "connectionUrl",
                  "services",
                  "tiebreaker"
                ]
              }
            ],
            "x-typeguard": true
          },
          {
            "title": "Close Peerconnection Message",
            "allOf": [
              {
                "title": "Command Message",
                "allOf": [
                  {
                    "title": "Message",
                    "type": "object",
                    "properties": {
                      "messageType": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "messageType"
                    ],
                    "additionalProperties": true,
                    "x-typeguard": true
                  },
                  {
                    "type": "object",
                    "properties": {
                      "messageType": {
                        "const": "command"
                      },
                      "command": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "messageType",
                      "command"
                    ]
                  }
                ],
                "x-typeguard": true
              },
              {
                "type": "object",
                "properties": {
                  "command": {
                    "const": "closePeerconnection"
                  },
                  "connectionUrl": {
                    "type": "string",
                    "format": "uri"
                  }
                },
                "required": [
                  "command",
                  "connectionUrl"
                ]
              }
            ],
            "x-typeguard": true
          },
          {
            "title": "Signaling Message",
            "allOf": [
              {
                "title": "Message",
                "type": "object",
                "properties": {
                  "messageType": {
                    "type": "string"
                  }
                },
                "required": [
                  "messageType"
                ],
                "additionalProperties": true,
                "x-typeguard": true
              },
              {
                "type": "object",
                "properties": {
                  "messageType": {
                    "const": "signaling"
                  },
                  "signalingType": {
                    "type": "string",
                    "enum": [
                      "offer",
                      "answer",
                      "candidate"
                    ]
                  },
                  "connectionUrl": {
                    "type": "string",
                    "format": "uri"
                  },
                  "content": {
                    "type": "object",
                    "additionalProperties": true
                  }
                },
                "required": [
                  "messageType",
                  "signalingType",
                  "connectionUrl",
                  "content"
                ]
              }
            ],
            "x-typeguard": true
          }
        ]
      }
    }
  },
  "required": true
}
        pass

    def getPeerconnections(self):
        
        pass

    def postPeerconnections(self, closedUrl: Optional[str] = None):
        {
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "title": "Peerconnection",
        "allOf": [
          {
            "title": "Peerconnection Overview",
            "type": "object",
            "properties": {
              "url": {
                "type": "string",
                "description": "URL of the peerconnection",
                "format": "uri",
                "readOnly": true
              },
              "devices": {
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": {
                  "type": "object",
                  "properties": {
                    "url": {
                      "type": "string",
                      "description": "URL of the device",
                      "format": "uri"
                    }
                  }
                }
              }
            }
          },
          {
            "type": "object",
            "properties": {
              "devices": {
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": {
                  "type": "object",
                  "properties": {
                    "url": {
                      "type": "string",
                      "description": "URL of the device",
                      "format": "uri"
                    },
                    "config": {
                      "type": "object",
                      "properties": {
                        "services": {
                          "type": "array",
                          "items": {
                            "title": "Service Config",
                            "type": "object",
                            "properties": {
                              "serviceType": {
                                "type": "string",
                                "format": "uri"
                              },
                              "serviceId": {
                                "type": "string"
                              },
                              "remoteServiceId": {
                                "type": "string"
                              }
                            },
                            "additionalProperties": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        "x-typeguard": true
      }
    }
  }
}
        pass

    def getPeerconnectionsByPeerconnectionId(self, url: str):
        
        pass

    def deletePeerconnectionsByPeerconnectionId(self, url: str):
        
        pass

    def getExperiments(self):
        
        pass

    def postExperiments(self):
        {
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "allOf": [
          {
            "type": "object",
            "properties": {
              "url": {
                "type": "string",
                "description": "URL of the experiment",
                "format": "uri",
                "readOnly": true
              },
              "status": {
                "type": "string",
                "description": "Status of the experiment",
                "enum": [
                  "created",
                  "booked",
                  "running",
                  "finished"
                ]
              }
            }
          },
          {
            "type": "object",
            "properties": {
              "bookingTime": {
                "type": "object",
                "properties": {
                  "startTime": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "endTime": {
                    "type": "string",
                    "format": "date-time"
                  }
                }
              },
              "devices": {
                "type": "array",
                "description": "Devices associated with the experiment",
                "items": {
                  "title": "Device",
                  "type": "object",
                  "properties": {
                    "device": {
                      "description": "URL to the [device](https://cross-lab-project.github.io/crosslab/api/device.html#get-/devices/-device_id-).",
                      "type": "string",
                      "format": "uri"
                    },
                    "role": {
                      "type": "string",
                      "description": "Name for an experiment role."
                    }
                  }
                }
              },
              "roles": {
                "type": "array",
                "description": "Roles that are used in this experiment",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "Name for an experiment role."
                    },
                    "description": {
                      "type": "string"
                    }
                  }
                }
              },
              "connections": {
                "type": "array",
                "description": "Connections associated with the experiment",
                "items": {
                  "description": "URL to the [peer connection](https://cross-lab-project.github.io/crosslab/api/device.html#get-/peerconnections/-peerconnection_id-).",
                  "type": "string",
                  "format": "uri"
                },
                "readOnly": true
              },
              "serviceConfigurations": {
                "type": "array",
                "description": "Services associated with the experiment",
                "items": {
                  "type": "object",
                  "properties": {
                    "serviceType": {
                      "type": "string",
                      "format": "uri",
                      "description": "Type of the service"
                    },
                    "configuration": {
                      "type": "object",
                      "description": "Configuration of the service\n\nThis configuration object will be merged with the participant configuration to become the service configuration send to the participant (fields of the participant configuration override the service configuration).\n",
                      "additionalProperties": true
                    },
                    "participants": {
                      "type": "array",
                      "description": "List of participants for the service",
                      "items": {
                        "title": "Participant",
                        "type": "object",
                        "properties": {
                          "role": {
                            "type": "string",
                            "description": "Name for an experiment role."
                          },
                          "serviceId": {
                            "type": "string"
                          },
                          "config": {
                            "type": "object",
                            "description": "Service configuration of the participant.\n\nThis configuration object will be merged with the service configuration to become the service configuration send to the participant (fields of the participant configuration override the service configuration).\n",
                            "additionalProperties": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
}
        pass

    def getExperimentsByExperimentId(self, url: str):
        
        pass

    def patchExperimentsByExperimentId(self, url: str, changedURL: Optional[str] = None):
        {
  "description": "Update the experiment",
  "content": {
    "application/json": {
      "schema": {
        "allOf": [
          {
            "type": "object",
            "properties": {
              "url": {
                "type": "string",
                "description": "URL of the experiment",
                "format": "uri",
                "readOnly": true
              },
              "status": {
                "type": "string",
                "description": "Status of the experiment",
                "enum": [
                  "created",
                  "booked",
                  "running",
                  "finished"
                ]
              }
            }
          },
          {
            "type": "object",
            "properties": {
              "bookingTime": {
                "type": "object",
                "properties": {
                  "startTime": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "endTime": {
                    "type": "string",
                    "format": "date-time"
                  }
                }
              },
              "devices": {
                "type": "array",
                "description": "Devices associated with the experiment",
                "items": {
                  "title": "Device",
                  "type": "object",
                  "properties": {
                    "device": {
                      "description": "URL to the [device](https://cross-lab-project.github.io/crosslab/api/device.html#get-/devices/-device_id-).",
                      "type": "string",
                      "format": "uri"
                    },
                    "role": {
                      "type": "string",
                      "description": "Name for an experiment role."
                    }
                  }
                }
              },
              "roles": {
                "type": "array",
                "description": "Roles that are used in this experiment",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "Name for an experiment role."
                    },
                    "description": {
                      "type": "string"
                    }
                  }
                }
              },
              "connections": {
                "type": "array",
                "description": "Connections associated with the experiment",
                "items": {
                  "description": "URL to the [peer connection](https://cross-lab-project.github.io/crosslab/api/device.html#get-/peerconnections/-peerconnection_id-).",
                  "type": "string",
                  "format": "uri"
                },
                "readOnly": true
              },
              "serviceConfigurations": {
                "type": "array",
                "description": "Services associated with the experiment",
                "items": {
                  "type": "object",
                  "properties": {
                    "serviceType": {
                      "type": "string",
                      "format": "uri",
                      "description": "Type of the service"
                    },
                    "configuration": {
                      "type": "object",
                      "description": "Configuration of the service\n\nThis configuration object will be merged with the participant configuration to become the service configuration send to the participant (fields of the participant configuration override the service configuration).\n",
                      "additionalProperties": true
                    },
                    "participants": {
                      "type": "array",
                      "description": "List of participants for the service",
                      "items": {
                        "title": "Participant",
                        "type": "object",
                        "properties": {
                          "role": {
                            "type": "string",
                            "description": "Name for an experiment role."
                          },
                          "serviceId": {
                            "type": "string"
                          },
                          "config": {
                            "type": "object",
                            "description": "Service configuration of the participant.\n\nThis configuration object will be merged with the service configuration to become the service configuration send to the participant (fields of the participant configuration override the service configuration).\n",
                            "additionalProperties": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
}
        pass

    def deleteExperimentsByExperimentId(self, url: str):
        
        pass

    