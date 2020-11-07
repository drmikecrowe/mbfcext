import { m } from "malevic";

export const Button = ({ handler }, ...children): Element => {
    return <button onclick={handler}>{...children}</button>;
};
