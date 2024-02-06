const svg = require('./model.svg');
export class AxisPortalAnimation {
  readonly SVG = svg;

  readonly XMax = 340; //Right
  readonly XMin = -340; //Left
  readonly XMiddle = 0; //Reference
  readonly YMin = 140; //Front
  readonly YMax = -55; //Back
  readonly YMiddle = 55; //Reference
  readonly ZMin = -80; //Up
  readonly ZMax = 73; //Down
  readonly ZMiddle = -7; //Between up and down

  sensors: Record<string, Element> = {};
  actuators: Record<string, Element> = {};
  XAxis: Element;
  YAxis: Element;
  ZAxis: Element;

  constructor() {}

  private root: ParentNode;
  init(root?: ParentNode) {
    if (root) {
      this.root = root;
    }
    if (!this.root) {
      return;
    }
    this.XAxis = this.root.querySelector('#xaxis');
    this.YAxis = this.root.querySelector('#yaxis');
    this.ZAxis = this.root.querySelector('#zaxis');

    this.sensors = {
      LimitXRight: this.root.querySelector('#sensor_x_right'),
      LimitXLeft: this.root.querySelector('#sensor_x_left'),
      LimitYBack: this.root.querySelector('#sensor_y_up'),
      LimitYFront: this.root.querySelector('#sensor_y_down'),
      LimitZBottom: this.root.querySelector('#sensor_z_bottom'),
      LimitZTop: this.root.querySelector('#sensor_z_top'),
    };

    this.actuators = {
      XMotorLeft: this.root.querySelector('#arrowleft'),
      XMotorRight: this.root.querySelector('#arrowright'),
      YMotorBack: this.root.querySelector('#arrowup'),
      YMotorFront: this.root.querySelector('#arrowdown'),
      ZMotorBottom: this.root.querySelector('#arrowbottom'),
      ZMotorTop: this.root.querySelector('#arrowtop'),
      Magnet: this.root.querySelector('#magnet'),
    };
  }

  update(
    sensors: Record<string, boolean>,
    actuators: Record<string, boolean>,
    XPosition: number,
    YPosition: number,
    ZPosition: number,
  ) {
    let schouldReInit = false;
    for (const sensor in sensors) {
      if (this.sensors[sensor]) {
        this.sensors[sensor].setAttribute(
          'fill',
          sensors[sensor] ? '#FFFF00' : '#7F7F00',
        );
      } else schouldReInit = true;
    }
    for (const actuator in actuators) {
      if (this.actuators[actuator]) {
        this.actuators[actuator].setAttribute(
          'fill',
          actuators[actuator] ? '#FFFF00' : '#7F7F00',
        );
      } else schouldReInit = true;
    }

    const XAxisPosition = (this.XMax - this.XMin) * XPosition + this.XMin;
    const YAxisPosition = (this.YMax - this.YMin) * YPosition + this.YMin;
    const ZAxisPosition = (this.ZMax - this.ZMin) * ZPosition + this.ZMin;

    if (this.XAxis) {
      this.XAxis.setAttribute('transform', 'translate(' + XAxisPosition + ',0)');
    } else schouldReInit = true;
    if (this.YAxis) {
      this.YAxis.setAttribute('transform', 'translate(0,' + YAxisPosition + ')');
    } else schouldReInit = true;
    if (this.ZAxis) {
      this.ZAxis.setAttribute('transform', 'translate(0,' + ZAxisPosition + ')');
    } else schouldReInit = true;

    if (schouldReInit) {
      this.init();
    }
  }
}
