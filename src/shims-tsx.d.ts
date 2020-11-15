declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
