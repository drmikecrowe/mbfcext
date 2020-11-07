import { m } from "malevic";

export const Icon = ({ icon }): Element => {
    const cls = `${icon.prefix} fa-${icon.iconName}`;
    // eslint-disable-next-line react/self-closing-comp
    return <i class={cls}></i>;
};
