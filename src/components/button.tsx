import type { ReactElement } from "react";

export default function Button({ handler, children }): ReactElement {
  return (
    <button onClick={handler} type="button">
      {children}
    </button>
  );
};

