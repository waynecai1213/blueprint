/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from "classnames";
import * as React from "react";

import { Classes } from "../../common";
import { DISPLAYNAME_PREFIX, type Props } from "../../common/props";

export interface MenuProps extends Props, React.HTMLAttributes<HTMLUListElement> {
    /** Menu items. */
    children?: React.ReactNode;

    /** Whether the menu items in this menu should use a large appearance. */
    large?: boolean;

    /** Whether the menu items in this menu should use a small appearance. */
    small?: boolean;

    /** Ref handler that receives the HTML `<ul>` element backing this component. */
    ulRef?: React.Ref<HTMLUListElement>;
}

/**
 * Menu component.
 *
 * @see https://blueprintjs.com/docs/#core/components/menu
 */
export const Menu: React.FC<MenuProps> = ({ className, children, large, small, ulRef, ...htmlProps }) => {
    const classes = classNames(className, Classes.MENU, {
        [Classes.LARGE]: large,
        [Classes.SMALL]: small,
    });
    return (
        <ul role="menu" {...htmlProps} className={classes} ref={ulRef}>
            {children}
        </ul>
    );
};
Menu.displayName = `${DISPLAYNAME_PREFIX}.Menu`;
