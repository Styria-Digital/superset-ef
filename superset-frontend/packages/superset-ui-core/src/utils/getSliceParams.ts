export const getSliceParams = (sliceParamsString?: string) => {
  let sliceParams: {
    translation?: {
      keys?: { [key: string]: string };
    };
  } = {};

  try {
    sliceParams = JSON.parse(sliceParamsString || '{}');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `"slice.params" was not parsable as valid JSON object: ${sliceParamsString}`,
    );
  }

  return sliceParams;
};
