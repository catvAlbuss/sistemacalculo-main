class StyleBase {
  static TEXT_CENTER = {
    textAlign: "center",
    textBaseline: "middle",
  };
  constructor(inherited) {
    this.inherited = inherited;
    this._selected = inherited.DEFAULT;
  }

  get() {
    return this._selected;
  }

  getModel() {
    return this.inherited;
  }

  default() {
    this._selected = this.inherited.DEFAULT;
  }

  selected() {
    this._selected = this.inherited.SELECTED;
  }

  hover() {
    this._selected = this.inherited.HOVER;
  }
}

export class NodeStyle extends StyleBase {
  static RADIUS = 6;
  static JOINT_FILL = "dimgray";
  static FORCE = {
    strokeStyle: "red",
    fillStyle: "red",
    font: "12px arial",
  };
  static DEFAULT = {
    ID: {
      ...this.TEXT_CENTER,
      fillStyle: "lightgray",
      strokeStyle: "lightgray",
      font: "10px arial",
    },
    MODEL: {
      ...this.TEXT_CENTER,
      fillStyle: "gray",
      strokeStyle: "gray",
      font: "10px arial",
    },
    WIREFRAME: {
      ...this.TEXT_CENTER,
      fillStyle: "orange",
    },
  };
  static SELECTED = {
    ID: this.DEFAULT.ID,
    MODEL: {
      ...this.DEFAULT.MODEL,
      fillStyle: "maroon",
      strokeStyle: "maroon",
      shadowColor: "maroon",
      shadowBlur: 5,
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      fillStyle: "maroon",
    },
  };
  static HOVER = {
    ID: this.DEFAULT.ID,
    MODEL: {
      ...this.DEFAULT.MODEL,
      fillStyle: "forestgreen",
      strokeStyle: "forestgreen",
      shadowColor: "forestgreen",
      shadowBlur: 5,
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      fillStyle: "forestgreen",
    },
  };
  constructor() {
    super(NodeStyle);
  }
}

export class BeamStyle extends StyleBase {
  static DEFAULT = {
    ID: {
      ...this.TEXT_CENTER,
      fillStyle: "lightgray",
      strokeStyle: "lightgray",
      font: "10px arial",
    },
    MODEL: {
      ...this.TEXT_CENTER,
      fillStyle: "#6D7B8D",
      strokeStyle: "#6D7B8D",
      font: "12px arial",
      lineWidth: 10,
    },
    WIREFRAME: {
      ...this.TEXT_CENTER,
      strokeStyle: "orange",
      lineWidth: 1,
    },
  };
  static SELECTED = {
    ID: this.DEFAULT.ID,
    MODEL: {
      ...this.DEFAULT.MODEL,
      fillStyle: "maroon",
      strokeStyle: "maroon",
      shadowColor: "maroon",
      shadowBlur: 5,
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      strokeStyle: "maroon",
    },
  };
  static HOVER = {
    ID: this.DEFAULT.ID,
    MODEL: {
      ...this.DEFAULT.MODEL,
      fillStyle: "forestgreen",
      strokeStyle: "forestgreen",
      shadowColor: "forestgreen",
      shadowBlur: 5,
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      strokeStyle: "forestgreen",
    },
  };
  static NORMAL = {
    MODEL: {
      ...this.DEFAULT.MODEL,
      strokeStyle: "darkgreen",
      fillStyle: "forestgreen",
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      strokeStyle: "darkgreen",
      fillStyle: "forestgreen",
    },
  };
  static TRACCION = {
    MODEL: {
      ...this.DEFAULT.MODEL,
      strokeStyle: "blue",
      fillStyle: "skyblue",
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      strokeStyle: "blue",
      fillStyle: "skyblue",
    },
  };
  static COMPRESION = {
    MODEL: {
      ...this.DEFAULT.MODEL,
      strokeStyle: "red",
      fillStyle: "orange",
    },
    WIREFRAME: {
      ...this.DEFAULT.WIREFRAME,
      strokeStyle: "red",
      fillStyle: "orange",
    },
  };
  constructor() {
    super(BeamStyle);
    this.axialStyle = BeamStyle.NORMAL;
  }

  normal() {
    this.axialStyle = BeamStyle.NORMAL;
  }

  traccion() {
    this.axialStyle = BeamStyle.TRACCION;
  }

  compresion() {
    this.axialStyle = BeamStyle.COMPRESION;
  }
}
