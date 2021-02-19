export const props = {
  label: {
    type: String,
    default: '',
  },
  info: {
    type: String,
    default: null,
  },
  value: {
    type: Number,
    required: true,
  },
  format: {
    type: Function,
    default: (v) => v,
  },
  conversion: {
    type: Function,
    default: (v) => v,
  },
  currency: {
    type: String,
    required: true,
  },
};
