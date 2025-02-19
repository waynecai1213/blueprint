/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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

import { Utils as CoreUtils } from "@blueprintjs/core";
import { DragHandleVertical } from "@blueprintjs/icons";

import type { Grid } from "../common";
import type { FocusedRegion, FocusMode } from "../common/cellTypes";
import * as Classes from "../common/classes";
import { CLASSNAME_EXCLUDED_FROM_TEXT_MEASUREMENT } from "../common/utils";
import { DragEvents } from "../interactions/dragEvents";
import type { ClientCoordinates, CoordinateData } from "../interactions/dragTypes";
import { DragReorderable, type ReorderableProps } from "../interactions/reorderable";
import { Resizable } from "../interactions/resizable";
import type { LockableLayout, Orientation } from "../interactions/resizeHandle";
import { DragSelectable, type SelectableProps } from "../interactions/selectable";
import type { Locator } from "../locator";
import { type Region, RegionCardinality, Regions } from "../regions";

import type { HeaderCellProps } from "./headerCell";

export type HeaderCellRenderer = (index: number) => React.ReactElement<HeaderCellProps>;

export interface HeaderProps extends LockableLayout, ReorderableProps, SelectableProps {
    /**
     * The the type shape allowed for focus areas. Can be cell, row, or none.
     */
    focusMode: FocusMode | undefined;

    /**
     * The currently focused region.
     */
    focusedRegion?: FocusedRegion;

    /**
     * The grid computes sizes of cells, rows, or columns from the
     * configurable `columnWidths` and `rowHeights`.
     */
    grid: Grid;

    /**
     * Enables/disables the reordering interaction.
     *
     * @internal
     * @default false
     */
    isReorderable?: boolean;

    /**
     * Enables/disables the resize interaction.
     *
     * @default true
     */
    isResizable?: boolean;

    /**
     * Locates the row/column/cell given a mouse event.
     */
    locator: Locator;

    /**
     * If true, all header cells render their loading state except for those
     * who have their `loading` prop explicitly set to false.
     *
     * @default false;
     */
    loading?: boolean;

    /**
     * When the user reorders something, this callback is called with the new
     * focus region for the newly selected set of regions.
     */
    onFocusedRegion: (focusedRegion: FocusedRegion) => void;

    /**
     * This callback is called while the user is resizing a header cell. The guides
     * array contains pixel offsets for where to display the resize guides in
     * the table body's overlay layer. `guides` will be null if this is the end
     * or cancellation of a resize interaction.
     */
    onResizeGuide: (guides: number[] | null) => void;
}

/**
 * These are additional props passed internally from ColumnHeader and RowHeader.
 * They don't need to be exposed to the outside world.
 */
export interface InternalHeaderProps extends HeaderProps {
    /**
     * The cardinality of a fully selected region. Should be FULL_COLUMNS for column headers and
     * FULL_ROWS for row headers.
     */
    fullRegionCardinality: RegionCardinality;

    /**
     * An optional callback invoked when the user double-clicks a resize handle, if resizing is enabled.
     */
    handleResizeDoubleClick?: (index: number) => void;

    /**
     * The name of the header-cell prop specifying whether the header cell is reorderable or not.
     */
    headerCellIsReorderablePropName: string;

    /**
     * The name of the header-cell prop specifying whether the header cell is selected or not.
     */
    headerCellIsSelectedPropName: string;

    /**
     * The highest cell index to render.
     */
    indexEnd: number;

    /**
     * The lowest cell index to render.
     */
    indexStart: number;

    /**
     * The maximum permitted size of the header in pixels. Corresponds to a width for column headers and
     * a height for row headers.
     */
    maxSize: number;

    /**
     * The minimum permitted size of the header in pixels. Corresponds to a width for column headers and
     * a height for row headers.
     */
    minSize: number;

    /**
     * The orientation of the resize handle. Should be VERTICAL for column headers and HORIZONTAL
     * for row headers.
     */
    resizeOrientation: Orientation;

    /**
     * An array containing the table's selection Regions.
     */
    selectedRegions: Region[];

    /**
     * Converts a point on the screen to a row or column index in the table grid.
     */
    convertPointToIndex: (clientXOrY: number, useMidpoint?: boolean) => number;

    /**
     * Provides any extrema classes for the provided index range in the table grid.
     */
    getCellExtremaClasses: (index: number, indexEnd: number) => string[];

    /**
     * Provides the index class for the cell. Should be Classes.columnCellIndexClass for column
     * headers or Classes.rowCellIndexClass for row headers.
     */
    getCellIndexClass: (index: number) => string;

    /**
     * Returns the size of the specified header cell in pixels. Corresponds to a width for column
     * headers and a height for row headers.
     */
    getCellSize: (index: number) => number;

    /**
     * Returns the relevant single coordinate from the provided client coordinates. Should return
     * the x coordinate for column headers and the y coordinate for row headers.
     */
    getDragCoordinate: (clientCoords: ClientCoordinates) => number;

    /**
     * A callback that returns the CSS index class for the specified index. Should be
     * Classes.columnIndexClass for column headers and Classes.rowIndexClass for row headers.
     */
    getIndexClass: (index: number) => string;

    /**
     * Given a mouse event, returns the relevant client coordinate (clientX or clientY). Should be
     * clientX for column headers and clientY for row headers.
     */
    getMouseCoordinate: (event: MouseEvent) => number;

    /**
     * Invoked when a resize interaction ends, if resizing is enabled.
     */
    handleResizeEnd: (index: number, size: number) => void;

    /**
     * Invoked whenever the size changes during a resize interaction, if resizing is enabled.
     */
    handleSizeChanged: (index: number, size: number) => void;

    /**
     * Returns true if the specified cell (and therefore the full column/row) is selected.
     */
    isCellSelected: (index: number) => boolean;

    /**
     * Returns true if the specified cell is at a ghost index.
     */
    isGhostIndex: (index: number) => boolean;

    /**
     * A callback that renders a ghost cell for the provided index.
     */
    ghostCellRenderer: (index: number, extremaClasses: string[]) => React.JSX.Element;

    /**
     * A callback that renders a regular header cell at the provided index.
     */
    headerCellRenderer: (index: number) => React.JSX.Element | null;

    /**
     * Converts a range to a region. This should be Regions.column for column headers and
     * Regions.row for row headers.
     */
    toRegion: (index1: number, index2?: number) => Region;

    /**
     * A callback that wraps the rendered cell components in additional parent elements as needed.
     */
    wrapCells: (cells: Array<React.ReactElement<any>>) => React.JSX.Element;
}

export interface HeaderState {
    /**
     * Whether the component has a valid selection specified either via props
     * (i.e. controlled mode) or via a completed drag-select interaction. When
     * true, DragReorderable will know that it can override the click-and-drag
     * interactions that would normally be reserved for drag-select behavior.
     */
    hasValidSelection: boolean;
}

const SHALLOW_COMPARE_PROP_KEYS_DENYLIST: Array<keyof InternalHeaderProps> = ["focusedRegion", "selectedRegions"];

export class Header extends React.Component<InternalHeaderProps, HeaderState> {
    protected activationIndex: number | null = null;

    private cellRefs: Map<number, React.RefObject<HTMLElement>> = new Map();

    private reorderHandleRefs: Map<number, React.RefObject<HTMLDivElement>> = new Map();

    public constructor(props: InternalHeaderProps) {
        super(props);
        this.state = { hasValidSelection: this.isSelectedRegionsControlledAndNonEmpty(props) };
    }

    public componentDidUpdate(_: InternalHeaderProps, prevState: HeaderState) {
        const nextHasValidSection = this.isSelectedRegionsControlledAndNonEmpty(this.props);
        if (prevState.hasValidSelection !== nextHasValidSection) {
            this.setState({ hasValidSelection: nextHasValidSection });
        }
    }

    public shouldComponentUpdate(nextProps: InternalHeaderProps, nextState: HeaderState) {
        return (
            !CoreUtils.shallowCompareKeys(this.state, nextState) ||
            !CoreUtils.shallowCompareKeys(this.props, nextProps, {
                exclude: SHALLOW_COMPARE_PROP_KEYS_DENYLIST,
            }) ||
            !CoreUtils.deepCompareKeys(this.props, nextProps, SHALLOW_COMPARE_PROP_KEYS_DENYLIST)
        );
    }

    public render() {
        return this.props.wrapCells(this.renderCells());
    }

    private isSelectedRegionsControlledAndNonEmpty(props: InternalHeaderProps = this.props) {
        return props.selectedRegions != null && props.selectedRegions.length > 0;
    }

    private convertEventToIndex = (event: MouseEvent) => {
        const coord = this.props.getMouseCoordinate(event);
        return this.props.convertPointToIndex(coord);
    };

    private locateClick = (event: MouseEvent): Region => {
        const menuContainer = (event.target as HTMLElement).closest(`.${Classes.TABLE_TH_MENU_CONTAINER}`);

        if (menuContainer && !menuContainer.classList.contains(Classes.TABLE_TH_MENU_SELECT_CELLS)) {
            return this.props.toRegion(-1);
        }

        this.activationIndex = this.convertEventToIndex(event);
        return this.props.toRegion(this.activationIndex);
    };

    private locateDragForSelection = (_event: MouseEvent, coords: CoordinateData, returnEndOnly = false): Region => {
        const coord = this.props.getDragCoordinate(coords.current);
        const indexEnd = this.props.convertPointToIndex(coord);
        if (returnEndOnly) {
            return this.props.toRegion(indexEnd);
        } else if (this.activationIndex !== null) {
            return this.props.toRegion(this.activationIndex, indexEnd);
        } else {
            // invalid state, cannot end a drag before starting one
            return {};
        }
    };

    private locateDragForReordering = (_event: MouseEvent, coords: CoordinateData) => {
        const coord = this.props.getDragCoordinate(coords.current);
        const guideIndex = this.props.convertPointToIndex(coord, true);
        return guideIndex < 0 ? undefined : guideIndex;
    };

    private renderCells = () => {
        const { indexStart, indexEnd } = this.props;

        const cells: React.JSX.Element[] = [];
        for (let index = indexStart; index <= indexEnd; index++) {
            const cell = this.renderNewCell(index);
            if (cell != null) {
                cells.push(cell);
            }
        }

        return cells;
    };

    private renderNewCell = (index: number) => {
        const extremaClasses = this.props.getCellExtremaClasses(index, this.props.indexEnd);
        const renderer = this.props.isGhostIndex(index) ? this.props.ghostCellRenderer : this.renderCell;
        return renderer(index, extremaClasses);
    };

    private renderCell = (index: number, extremaClasses: string[]) => {
        const { getIndexClass, selectedRegions } = this.props;

        const cell = this.props.headerCellRenderer(index);
        if (cell == null) {
            return null;
        }

        const isLoading = cell.props.loading != null ? cell.props.loading : this.props.loading;
        const isSelected = this.props.isCellSelected(index);
        const isEntireCellTargetReorderable = this.isEntireCellTargetReorderable(index);

        const className = classNames(
            extremaClasses,
            {
                [Classes.TABLE_HEADER_REORDERABLE]: isEntireCellTargetReorderable,
            },
            this.props.getCellIndexClass(index),
            cell.props.className,
        );

        const cellTargetRef = getOrCreateRef(this.cellRefs, index);
        const cellProps: HeaderCellProps = {
            className,
            index,
            [this.props.headerCellIsSelectedPropName]: isSelected,
            [this.props.headerCellIsReorderablePropName]: isEntireCellTargetReorderable,
            loading: isLoading,
            reorderHandle: this.maybeRenderReorderHandle(index),
            targetRef: cellTargetRef,
        };

        const modifiedHandleSizeChanged = (size: number) => this.props.handleSizeChanged(index, size);
        const modifiedHandleResizeEnd = (size: number) => this.props.handleResizeEnd(index, size);
        const modifiedHandleResizeHandleDoubleClick = () => this.props.handleResizeDoubleClick?.(index);

        const baseChildren = (
            <DragSelectable
                enableMultipleSelection={this.props.enableMultipleSelection}
                disabled={this.isDragSelectableDisabled}
                focusedRegion={this.props.focusedRegion}
                focusMode={this.props.focusMode}
                ignoredSelectors={[`.${Classes.TABLE_REORDER_HANDLE_TARGET}`]}
                key={getIndexClass(index)}
                locateClick={this.locateClick}
                locateDrag={this.locateDragForSelection}
                onFocusedRegion={this.props.onFocusedRegion}
                onSelection={this.handleDragSelectableSelection}
                onSelectionEnd={this.handleDragSelectableSelectionEnd}
                selectedRegions={selectedRegions}
                selectedRegionTransform={this.props.selectedRegionTransform}
                targetRef={cellTargetRef}
            >
                <Resizable
                    isResizable={this.props.isResizable}
                    maxSize={this.props.maxSize}
                    minSize={this.props.minSize}
                    // eslint-disable-next-line react/jsx-no-bind
                    onDoubleClick={modifiedHandleResizeHandleDoubleClick}
                    onLayoutLock={this.props.onLayoutLock}
                    // eslint-disable-next-line react/jsx-no-bind
                    onResizeEnd={modifiedHandleResizeEnd}
                    // eslint-disable-next-line react/jsx-no-bind
                    onSizeChanged={modifiedHandleSizeChanged}
                    orientation={this.props.resizeOrientation}
                    size={this.props.getCellSize(index)}
                >
                    {React.cloneElement(cell, cellProps)}
                </Resizable>
            </DragSelectable>
        );

        return this.isReorderHandleEnabled()
            ? baseChildren // reordering will be handled by interacting with the reorder handle
            : this.wrapInDragReorderable(index, baseChildren, this.isDragReorderableDisabled, cellTargetRef);
    };

    private isReorderHandleEnabled() {
        // the reorder handle can only appear in the column interaction bar
        return this.isColumnHeader() && this.props.isReorderable;
    }

    private maybeRenderReorderHandle(index: number) {
        const handleTargetRef = getOrCreateRef(this.reorderHandleRefs, index);
        return !this.isReorderHandleEnabled()
            ? undefined
            : this.wrapInDragReorderable(
                  index,
                  <div className={Classes.TABLE_REORDER_HANDLE_TARGET} ref={handleTargetRef}>
                      <div
                          className={classNames(Classes.TABLE_REORDER_HANDLE, CLASSNAME_EXCLUDED_FROM_TEXT_MEASUREMENT)}
                      >
                          <DragHandleVertical title="Press down to drag" />
                      </div>
                  </div>,
                  false,
                  handleTargetRef,
              );
    }

    private isColumnHeader() {
        return this.props.fullRegionCardinality === RegionCardinality.FULL_COLUMNS;
    }

    private wrapInDragReorderable(
        index: number,
        children: React.JSX.Element,
        disabled: boolean | ((event: MouseEvent) => boolean),
        targetRef: React.RefObject<HTMLElement>,
    ) {
        return (
            <DragReorderable
                disabled={disabled}
                focusMode={this.props.focusMode}
                key={this.props.getIndexClass(index)}
                locateClick={this.locateClick}
                locateDrag={this.locateDragForReordering}
                onReordered={this.props.onReordered}
                onReordering={this.props.onReordering}
                onSelection={this.props.onSelection}
                onFocusedRegion={this.props.onFocusedRegion}
                selectedRegions={this.props.selectedRegions}
                targetRef={targetRef}
                toRegion={this.props.toRegion}
            >
                {children}
            </DragReorderable>
        );
    }

    private handleDragSelectableSelection = (selectedRegions: Region[]) => {
        this.props.onSelection(selectedRegions);
        this.setState({ hasValidSelection: false });
    };

    private handleDragSelectableSelectionEnd = () => {
        this.activationIndex = null; // not strictly required, but good practice
        this.setState({ hasValidSelection: true });
    };

    private isDragSelectableDisabled = (event: MouseEvent) => {
        if (DragEvents.isAdditive(event)) {
            // if the meta/ctrl key was pressed, we want to forcefully ignore
            // reordering interactions and prioritize drag-selection
            // interactions (e.g. to make it possible to deselect a row).
            return false;
        }
        const cellIndex = this.convertEventToIndex(event);
        return this.isEntireCellTargetReorderable(cellIndex);
    };

    private isDragReorderableDisabled = (event: MouseEvent) => {
        const isSelectionEnabled = !this.isDragSelectableDisabled(event);
        if (isSelectionEnabled) {
            // if drag-selection is enabled, we don't want drag-reordering
            // interactions to compete. otherwise, a mouse-drag might both expand a
            // selection and reorder the same selection simultaneously - confusing!
            return true;
        }
        const cellIndex = this.convertEventToIndex(event);
        return !this.isEntireCellTargetReorderable(cellIndex);
    };

    private isEntireCellTargetReorderable = (index: number): boolean => {
        const { isReorderable = false, selectedRegions } = this.props;
        // although reordering may be generally enabled for this row/column (via props.isReorderable), the
        // row/column shouldn't actually become reorderable from a user perspective until a few other
        // conditions are true:
        return (
            isReorderable &&
            // the row/column should be the only selection (or it should be part of the only selection),
            // because reordering multiple disjoint row/column selections is a UX morass with no clear best
            // behavior.
            this.props.isCellSelected(index) &&
            this.state.hasValidSelection &&
            Regions.getRegionCardinality(selectedRegions[0]) === this.props.fullRegionCardinality &&
            // selected regions can be updated during mousedown+drag and before mouseup; thus, we
            // add a final check to make sure we don't enable reordering until the selection
            // interaction is complete. this prevents one click+drag interaction from triggering
            // both selection and reordering behavior.
            selectedRegions.length === 1 &&
            // columns are reordered via a reorder handle, so drag-selection needn't be disabled
            !this.isReorderHandleEnabled()
        );
    };
}

function getOrCreateRef<T>(refMap: Map<number, React.RefObject<T>>, index: number): React.RefObject<T> {
    if (refMap.has(index)) {
        return refMap.get(index)!;
    } else {
        const newRef = React.createRef<T>();
        refMap.set(index, newRef);
        return newRef;
    }
}
