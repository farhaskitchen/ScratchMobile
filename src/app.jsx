import React, {useEffect, useRef, useState} from 'react';
import GUI, {AppStateHOC} from 'scratch-gui';

import './mobile.css';

// scratch-gui's `flexWrapper` div always renders exactly two children in this order:
//   [0] editorWrapper        -- blocks/costumes/sounds tabs (our "Code" tab)
//   [1] stageAndTargetWrapper -- stage canvas + sprite/backdrop panel (our "Stage" tab)
// Their class names are CSS Modules hashes so we can't select them by class. Structural
// position is the stable contract here: as long as gui.jsx keeps rendering those two
// panes as the two children of flexWrapper (true since scratch-gui's initial React
// rewrite), this holds regardless of hash changes on upstream updates.
//
// We find flexWrapper once (it's the parent of MenuBar's next sibling's first child --
// simplest robust path is: find the Box with exactly these two descendant regions by
// looking for the stage canvas element, then walking up to its structural sibling pair.

const TABS = {
    CODE: 'code',
    STAGE: 'stage'
};

const WrappedGUI = AppStateHOC(GUI, true);

const findFlexWrapperChildren = rootEl => {
    // The stage canvas is unambiguous -- scratch-render always mounts a <canvas>
    // inside stageAndTargetWrapper. Walk up from it to find the flexWrapper pair.
    const canvas = rootEl.querySelector('canvas');
    if (!canvas) return null;

    // stageAndTargetWrapper is an ancestor of canvas; walk up until we find an
    // element whose parent has exactly 2 element children (the flexWrapper split).
    let node = canvas;
    while (node && node !== rootEl) {
        const parent = node.parentElement;
        if (parent && parent.children.length === 2) {
            return {
                editorPane: parent.children[0],
                stagePane: parent.children[1]
            };
        }
        node = parent;
    }
    return null;
};

const App = () => {
    const [activeTab, setActiveTab] = useState(TABS.CODE);
    const rootRef = useRef(null);
    const panesRef = useRef(null);

    useEffect(() => {
        // scratch-gui mounts asynchronously (VM init, project load), so the canvas
        // isn't present on first render. Poll briefly until we can locate the panes.
        let cancelled = false;
        const tryFind = () => {
            if (cancelled || !rootRef.current) return;
            const panes = findFlexWrapperChildren(rootRef.current);
            if (panes) {
                panesRef.current = panes;
                applyTab(activeTab);
            } else {
                requestAnimationFrame(tryFind);
            }
        };
        tryFind();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyTab = tab => {
        const panes = panesRef.current;
        if (!panes) return;
        panes.editorPane.style.display = tab === TABS.CODE ? '' : 'none';
        panes.stagePane.style.display = tab === TABS.STAGE ? '' : 'none';
    };

    const selectTab = tab => {
        setActiveTab(tab);
        applyTab(tab);
    };

    return (
        <div className="sm-app" ref={rootRef}>
            <div className="sm-tabbar">
                <button
                    className={activeTab === TABS.CODE ? 'sm-tab active' : 'sm-tab'}
                    onClick={() => selectTab(TABS.CODE)}
                >
                    Code
                </button>
                <button
                    className={activeTab === TABS.STAGE ? 'sm-tab active' : 'sm-tab'}
                    onClick={() => selectTab(TABS.STAGE)}
                >
                    Stage
                </button>
            </div>
            <div className="sm-gui-wrap">
                <WrappedGUI
                    basePath="/"
                    canEditTitle
                    enableCommunity={false}
                />
            </div>
        </div>
    );
};

export default App;

