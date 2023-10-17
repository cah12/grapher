"include ['legend']";

class MyLegend extends Legend {
  constructor() {
    super();
    const self = this;

    this.updateLegendToolTip = function (_curve) {
      let indepVarX = null;
      let indepVarY = null;
      let precisionY = _curve.plot().axisPrecision(_curve.yAxis());
      let precisionX = _curve.plot().axisPrecision(_curve.xAxis());
      let decimalPlacesY = _curve.plot().axisDecimalPlaces(_curve.yAxis());
      let decimalPlacesX = _curve.plot().axisDecimalPlaces(_curve.xAxis());

      let fnStr = null;
      let fnStrLatex = _curve.latex;
      if (
        (_curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
          _curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram) &&
        _curve.functionDlgData
      ) {
        fnStr = `f(${_curve.functionDlgData.variable}, ${_curve.functionDlgData.variableY}): ${_curve.fn}`;
      }
      if (_curve.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if (_curve.parametricFnX && _curve.parametricFnY) {
          let parametricFnX = _curve.parametricFnX;
          if (!isNaN(parametricFnX)) {
            parametricFnX = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(parametricFnX, decimalPlacesX),
              precisionX
            );
          }
          let parametricFnY = _curve.parametricFnY;
          if (!isNaN(parametricFnY)) {
            parametricFnY = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(parametricFnY, decimalPlacesY),
              precisionY
            );
          }
          fnStr = `Parametric(${_curve.parametric_variable}): (${parametricFnX}, ${parametricFnY})`;
        } else if (_curve.fn) {
          precisionY;
          let fn_y = _curve.fn;
          if (!isNaN(fn_y)) {
            fn_y = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(_curve.fn, decimalPlacesY),
              precisionY
            );
          }
          fnStr = `f(${_curve.variable}): ${fn_y}`;
        }
      }
      if (_curve.rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
        const val = _curve.value();
        fnStr = `${_curve.toolTipValueName} (${Utility.toPrecision(
          Utility.adjustForDecimalPlaces(val.x, decimalPlacesX),
          precisionX
        )}, ${Utility.toPrecision(
          Utility.adjustForDecimalPlaces(val.y, decimalPlacesY),
          precisionY
        )})`;
      }
      var rowNumber = self.indexInLegend(_curve);
      const horizontal =
        _curve.xAxis() == Axis.AxisId.xBottom ? "Bottom" : "Top";
      const vertical = _curve.yAxis() == Axis.AxisId.yLeft ? "Left" : "Right";
      //let fn = "f(x): N/A";
      let title = "Axes: " + horizontal + ", " + vertical;

      if (fnStr) {
        const arr = fnStr.split(":");
        fnStr = arr[1];

        if (arr.length < 2) {
          return;
        }
        fnStr = fnStr.replaceAll(" ", "");

        let parametricArr = [];
        let parametricObj = Utility.splitParametricFunction(fnStr);
        if (!parametricObj) {
          parametricArr.push(fnStr);
        } else {
          parametricArr.push(parametricObj.operand);
          parametricArr.push(parametricObj.base);
        }

        let m_fnConcat = "";

        for (let i = 0; i < parametricArr.length; i++) {
          let fnStr = parametricArr[i];

          // let ind = fnStr.indexOf("^");
          // while (ind !== -1 /* && index - 3 >= 0 */) {
          //   const prefix = Utility.getExponentTokenPrefix(fnStr, ind);
          //   let obj = Utility.getOperandOfExponentToken(fnStr, ind);
          //   if (obj.operand.length > 1 && obj.operand[0] !== "(") {
          //     fnStr = fnStr.replace(
          //       `${prefix}^${obj.operand[0]}`,
          //       `(${prefix}^${obj.operand[0]})`
          //     );
          //   }
          //   ind = fnStr.indexOf("^", ind + 2);
          // }

          //Replace the whitespace delimiters stripped out by simplify()
          fnStr = fnStr.replaceAll("mod", " mod ");

          let m_fn = "";
          if (_curve.rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
            m_fn = fnStr;
          } else {
            Utility.adjustLatexLogBaseDecimalPlaces(decimalPlacesX);
            fnStr = fnStr.replaceAll("+-", "-").replaceAll("-+", "-");
            //nerdamer.flush();
            // m_fn = math
            //   .parse(fnStr)
            //   .toTex({ parenthesis: "auto", implicit: "hide" });
            m_fn = math
              .simplify(fnStr, {}, { exactFractions: false })
              .toTex({ parenthesis: "auto", implicit: "hide" });

            //.simplify(fnStr, {}, { exactFractions: false })
            Utility.restoreLatexLogBaseDecimalPlaces();
          }

          let ind = m_fn.indexOf("log(");
          while (ind !== -1) {
            let operand = Utility.getOperand(m_fn, "log", ind).operand;
            const obj = Utility.splitParametricFunction(operand);
            m_fn = m_fn.replace(
              `log${operand}`,
              `\\mathrm{log_{${obj.base}}}\\left(${obj.operand}\\right)`
            );
            ind = m_fn.indexOf("log(");
          }

          if (parametricArr.length > 1) {
            if (i == 0) {
              m_fnConcat += "(";
              m_fnConcat += m_fn;
              m_fnConcat += ",";
            } else {
              m_fnConcat += m_fn;
              m_fnConcat += ")";
            }
          } else {
            m_fnConcat += m_fn;
          }
        }
        title += "\n" + `${arr[0]}:` + m_fnConcat;
        title = title.replaceAll("log_{undefined}", "ln");
      }
      self.setTooltip(rowNumber, title);
      _curve = 0;
    };

    Static.bind("legendUpdated", function (e, _curve) {
      self.updateLegendToolTip(_curve);
    });

    Static.bind("axisChanged", function (e, axis, _curve) {
      self.updateLegendToolTip(_curve);
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      if (
        on &&
        (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
          plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
          plotItem.rtti == PlotItem.RttiValues.Rtti_PlotZone ||
          plotItem.rtti == PlotItem.RttiValues.Rtti_PlotMarker ||
          plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram)
      ) {
        //console.log(plotItem);
        self.updateLegendToolTip(plotItem);
      }
    });
  }
}
