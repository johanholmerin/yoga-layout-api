import yogaPromise from 'yoga-dom';

// https://github.com/vincentriemer/react-native-dom/blob/88fe69fe9d8b9d62e0642e493877ce469cd7a608/packages/react-native-dom/ReactDom/views/RCTShadowView.js#L42
function convertToYogaValue(input, units) {
  if (typeof input === 'number') {
    return { value: input, unit: units.point };
  } else if (input == null) {
    // TODO: Figure out why this isn't unsetting the value in Yoga
    // Found it: https://github.com/facebook/yoga/blob/5e3ffb39a2acb05d4fe93d04f5ae4058c047f6b1/yoga/Yoga.h#L28
    // return { value: NaN, unit: units.undefined };
    return { value: 0, unit: units.point };
  }
  if (input === 'auto') {
    return { value: NaN, unit: units.auto };
  }
  return {
    value: parseFloat(input),
    unit: input.endsWith('%') ? units.percent : units.point
  };
}

yogaPromise.then(Yoga => {
  registerLayout('yoga', class {
    static get inputProperties() {
      return [
        'align-content',
        'align-items',
        'flex-direction',
        'flex-wrap',
        'justify-content'
      ];
    }

    static get childInputProperties() {
      return [
        'align-self',
        'flex-basis',
        'flex-grow',
        'flex-shrink',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'width',
        'height'
      ];
    }

    *intrinsicSizes() {}
    *layout(children, edges, constraints, styleMap) {
      const { fixedInlineSize, fixedBlockSize } = constraints;

      const root = new Yoga.Node();

      // Flex
      root.flexDirection = Yoga.Constants.flexDirection[
        styleMap.get('flex-direction').toString()
      ];
      root.flexWrap = Yoga.Constants.wrap[styleMap.get('flex-wrap').toString()];
      root.alignItems = Yoga.Constants.align[
        styleMap.get('align-items').toString()
      ] || Yoga.Constants.align['stretch'];
      root.alignContent = Yoga.Constants.align[
        styleMap.get('align-content').toString()
      ] || Yoga.Constants.align['flex-start'];
      root.justifyContent = Yoga.Constants.justify[
        styleMap.get('justify-content').toString()
      ] || Yoga.Constants.justify['flex-start'];

      for (const child of children) {
        const index = children.indexOf(child);
        const node = new Yoga.Node();

        // Margin
        node.marginTop = convertToYogaValue(
          child.styleMap.get('margin-top').toString(),
          Yoga.Constants.unit
        );
        node.marginRight = convertToYogaValue(
          child.styleMap.get('margin-right').toString(),
          Yoga.Constants.unit
        );
        node.marginBottom = convertToYogaValue(
          child.styleMap.get('margin-bottom').toString(),
          Yoga.Constants.unit
        );
        node.marginLeft = convertToYogaValue(
          child.styleMap.get('margin-left').toString(),
          Yoga.Constants.unit
        );

        // Padding
        node.paddingTop = convertToYogaValue(
          child.styleMap.get('padding-top').toString(),
          Yoga.Constants.unit
        );
        node.paddingRight = convertToYogaValue(
          child.styleMap.get('padding-right').toString(),
          Yoga.Constants.unit
        );
        node.paddingBottom = convertToYogaValue(
          child.styleMap.get('padding-bottom').toString(),
          Yoga.Constants.unit
        );
        node.paddingLeft = convertToYogaValue(
          child.styleMap.get('padding-left').toString(),
          Yoga.Constants.unit
        );

        // Flex
        node.flexBasis = convertToYogaValue(
          child.styleMap.get('flex-basis').toString(),
          Yoga.Constants.unit
        );
        node.flexGrow = child.styleMap.get('flex-grow').value;
        node.flexShrink = child.styleMap.get('flex-shrink').value;
        node.alignSelf = Yoga.Constants.align[
          child.styleMap.get('align-self').toString()
        ] || Yoga.Constants.align.auto;

        // Size
        node.height = convertToYogaValue(
          child.styleMap.get('height').toString(),
          Yoga.Constants.unit
        );
        node.width = convertToYogaValue(
          child.styleMap.get('width').toString(),
          Yoga.Constants.unit
        );

        root.insertChild(node, index);
      }

      // Calculate
      root.calculateLayout(fixedInlineSize, fixedBlockSize);

      const childFragments = [];
      for (const child of children) {
        const index = children.indexOf(child);
        const layout = root.getChild(index).getComputedLayout();
        const fragment = yield child.layoutNextFragment({
          inlineSize: layout.width,
          blockSize: layout.height
        });

        // Position
        fragment.inlineOffset = layout.left;
        fragment.blockOffset = layout.top;

        childFragments.push(fragment);
      }

      return { childFragments };
    }
  });
});
