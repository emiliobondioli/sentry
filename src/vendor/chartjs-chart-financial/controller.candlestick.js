"use strict";

import { defaults } from "chart.js";
import { merge } from "./helpers";
import FinancialController from "./controller.financial";
import CandlestickElement from "./element.candlestick";

class CandlestickController extends FinancialController {
  updateElements(elements, start, count, mode) {
    const me = this;
    const dataset = me.getDataset();
    // console.log(dataset, elements)
    const ruler = me._ruler || me._getRuler();
    const firstOpts = me.resolveDataElementOptions(start, mode);
    const sharedOptions = me.getSharedOptions(firstOpts);
    const includeOptions = me.includeOptions(mode, sharedOptions);

    me.updateSharedOptions(sharedOptions, mode, firstOpts);

    for (let i = start; i < count; i++) {
      const options = sharedOptions || me.resolveDataElementOptions(i, mode);
      
      const baseProperties = me.calculateElementProperties(
        i,
        ruler,
        mode === "reset",
        options
        );
        //console.log(baseProperties)
      const properties = {
        ...baseProperties,
        datasetLabel: dataset.label || "",
        // label: '', // to get label value please use dataset.data[index].label

        // Appearance
        color: dataset.color,
        borderColor: dataset.borderColor,
        borderWidth: dataset.borderWidth,
      };

      if (includeOptions) {
        properties.options = options;
      }
      me.updateElement(elements[i], i, properties, mode);
    }
  }
}

CandlestickController.id = "candlestick";
CandlestickController.defaults = merge(
  {
    dataElementType: CandlestickElement.id,
  },
  defaults.financial
);

export default CandlestickController;
