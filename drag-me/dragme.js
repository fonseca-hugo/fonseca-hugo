/* ===================================================
 * dragMe.js v0.5
 * Drag me is a cross-browser ultra lightweight plugin to make "elements" draggable
 * Alternatives like jQuery require jQuery and jQuery.UI (or jQuery.UI.widget + jQuery.UI.Draggable + jQuery.UI.mouse)
 * https://github.com/fonseca-hugo/DragMe
 * 
 * @name dragMe.js
 * @author Hugo Fonseca (fonseca.hugo@gmail.com)
 * @version 0.5
 * @date 29/07/2013
 * ===================================================
 * Copyright (c) 2013 Hugo Fonseca (www.hugofonseca.co.uk)
 * 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
HFDragMe = {
    isDragging: false,
    itemDragging: null,
    initMouseX: null,
    initMouseY: null,
    defaults: {
        cursor: "move",
        changeZIndex: false,
        zIndex: 1000002,
        opacity: 0.75,
        //delay: 20
    },
    /**
     * Initial Setup
     *
     * @param {string || object} elem The element to drag
     * @param {string || object} handle The handle that is used to drag the element
     * @param {object} options The options
     **/
    setup: function (elem, handle, options) {
        if (typeof elem === "string") {
            elem = document.getElementById(elem);
        }
        if (typeof handle === "string") {
            handle = document.getElementById(handle);
        }

        if (elem !== null && handle !== null) {
            HFDragMe.setOptions(options);
            HFDragMe.makeDraggable(elem, handle);
        }
    },
    /**
     * Sets the options
     *
     * @param options Options to override the defaults
     **/
    setOptions: function (options) {
        HFDragMe.displayOptions = {};
        if (typeof options !== "undefined") {
            HFDragMe.displayOptions = options;
        }
        // Override defaults for submitted options.
        for (var i in HFDragMe.defaults) {
            if (typeof HFDragMe.displayOptions[i] === "undefined") {
                HFDragMe.displayOptions[i] = HFDragMe.defaults[i];
            }
        }
    },
    /**
     * Make the element draggable
     *
     * @param {string || object} elem The element to drag
     * @param {string || object} handle The handle that is used to drag the element
     **/
    makeDraggable: function(elem, handle) {
        var initialPosition = {x: 0, y: 0},
            onlyBox = false;

        handle.draggableItem   = elem;
        handle.style.cursor = HFDragMe.displayOptions.cursor;

        if (elem.style.position === "fixed") {
            onlyBox = true;
        }

        initialPosition = HFUtils.offset(elem, onlyBox);

        elem.initialPositionX = initialPosition.left;
        elem.initialPositionY = initialPosition.top;

        if (elem.style.position !== "absolute" && elem.style.position !== "fixed") {
            elem.style.position = "absolute";
        }

        elem.style.left = initialPosition.left + "px";
        elem.style.top = initialPosition.top + "px";
        elem.originalOpacity = elem.style.opacity;

        // Attach Events
        HFUtils.listen("mousedown", handle, HFDragMe.onMouseDown);
    },
    /**
     * Attach the mouseMove and mouseUp events when user clicks on the handle
     * Activate dragging
     *
     * @param {object} e The Event
     **/
    onMouseDown: function(e) {
        e = HFUtils.normalizeEvent(e);
        var rightClick = HFUtils.isRightClick(e),
            target = HFUtils.findTarget(e);

        if (!rightClick) {
            // Look for target  with draggableItem property
            while (target !== null && !target.draggableItem) {
                target = target.parentNode ? target.parentNode : target.parentElement;
            }

            if (target !== null) {
                var dragItem = target.draggableItem;
                dragItem.originalLeft = parseInt(dragItem.style.left);
                dragItem.originalTop  = parseInt(dragItem.style.top);
                dragItem.style.opacity = HFDragMe.displayOptions.opacity;
                if (HFDragMe.displayOptions.changeZIndex) {
                    dragItem.style.zIndex = HFDragMe.displayOptions.zIndex;
                }

                HFDragMe.isDragging = true;
                HFDragMe.initMouseX = e.clientX;
                HFDragMe.initMouseY = e.clientY;
                HFDragMe.itemDragging = dragItem;

                if (typeof HFDragMe.displayOptions.callback !== "undefined") {
                    HFDragMe.displayOptions.callback();
                }
                // Attach Events
                HFUtils.listen("mousemove", document, HFDragMe.onMouseMove);
                HFUtils.listen("mouseup", document, HFDragMe.onMouseUp);
                HFUtils.listen("keydown", document, HFDragMe.onKeyPress);
            }
        }

        HFUtils.preventDefaultPropagation(e);
    },
    /**
     * Listen to keys pressed
     * ESC stops the dragging
     *
     * @param {object} e The Event
     **/
    onKeyPress : function(e) {
        e = HFUtils.normalizeEvent(e);
        var keycode = (e.which) ? e.which : e.keyCode;
        if (keycode === 27) {
            HFDragMe.onMouseUp(e);
        }
        HFUtils.preventDefaultPropagation(e);
    },
    /**
     * Reposition the element that is being dragged
     *
     * @param {object} e The Event
     **/
    onMouseMove : function(e) {
        e = HFUtils.normalizeEvent(e);
        if (HFDragMe.isDragging) {
            //setTimeout(function () {
            HFDragMe.repositionElem(e, HFDragMe.itemDragging);
            //}, HFDragMe.displayOptions.delay);
        }

        HFUtils.preventDefaultPropagation(e);
    },
    /**
     * Remove listeners
     * Terminate dragging
     *
     * @param {object} e The Event
     **/
    onMouseUp : function(e) {
        e = HFUtils.normalizeEvent(e);

        if (HFDragMe.itemDragging) {
            HFDragMe.itemDragging.style.opacity = HFDragMe.itemDragging.originalOpacity;
        }

        HFDragMe.itemDragging = null;
        HFDragMe.isDragging = false;
        HFDragMe.initMouseX = null;
        HFDragMe.initMouseY = null;

        // Detach Events
        HFUtils.stopListening("mousemove", document, null);
        HFUtils.stopListening("mouseup", document, null);
        HFUtils.stopListening("keypress", document, null);

        HFUtils.preventDefaultPropagation(e);
    },
    /**
     * Reposition the element based on the mouse movement
     *
     * @param {object} e The Event
     * @param {object} dragItme The element to position
     **/
    repositionElem : function (e, dragItem) {
        var eventx    = e.clientX,
            eventy    = e.clientY,
            newleft   = (dragItem.originalLeft + eventx - HFDragMe.initMouseX) * 1,
            newtop    = (dragItem.originalTop + eventy - HFDragMe.initMouseY) * 1;

        dragItem.style.left = newleft + "px";
        dragItem.style.top  = newtop + "px";
    }
};

/**
 * UTILS
 *
 * Reusable components
 **/
HFUtils = {
    /**
     * Prevent Default Behaviour and Stop Propagation (Bubbling)
     *
     * @param {object} e The Event
     **/
    preventDefaultPropagation: function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
    },
    /**
     * Cross-browser event treatment
     *
     * @param {object} e The Event
     **/
    normalizeEvent : function (e) {
        return (!e) ? window.event : e;
    },
    /**
     * Get the element position using the getBoundingClientRect()
     *
     * @param {object} elem The Element
     **/
    offset: function (elem, onlyBox) {
        var body = document.body,
            win = document.defaultView,
            docElem = document.documentElement,
            box = document.createElement('div'),
            isBoxModel,
            clientTop,
            clientLeft,
            scrollTop,
            scrollLeft;

        box.style.paddingLeft = box.style.width = "1px";
        body.appendChild(box);
        isBoxModel = (box.offsetWidth === 2);
        body.removeChild(box);
        box = elem.getBoundingClientRect();

        if (typeof onlyBox !== "undefined" && onlyBox) {
            clientTop  = clientLeft = scrollTop = scrollLeft = 0;
        } else {
            clientTop  = docElem.clientTop  || body.clientTop  || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
                scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
        }

        return {
            top : box.top  + scrollTop  - clientTop,
            left: box.left + scrollLeft - clientLeft
        };
    },
    /**
     * Cross-browser right click detection
     *
     * @param {object} e The Event
     **/
    isRightClick: function (e) {
        var rightClick = false;

        if (typeof e.which !== "undefined") { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            rightClick = (e.which === 3);
        } else if (typeof e.button !== "undefined") {  // IE, Opera 
            rightClick = (e.button === 2);
        }

        return rightClick;
    },
    /**
     * Cross-browser target detection
     *
     * @param {object} e The Event
     **/
    findTarget : function (e) {
        var target;

        if (e.target) {
            target = e.target;
        } else if (e.srcElement) {
            target = e.srcElement;
        }
        if (target.nodeType === 3) {// Safari bug
            target = target.parentNode;
        }

        return target;
    },
    /**
     * Cross-browser event listener / attach
     *
     * @param {object} evnt The Event
     * @param {object} elem The Element to attach the event
     * @param {object} func The Function to run when event occurs
     **/
    listen: function(evnt, elem, func) {
        if (typeof elem.addEventListener !== "undefined") {
            elem.addEventListener(evnt, func, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + evnt, func);
        }
    },
    /**
     * Cross-browser remove event listener / detach
     *
     * @param {object} evnt The Event
     * @param {object} elem The Element to detach the event
     * @param {object} func The Function to run when event occurs
     **/
    stopListening: function (evnt, elem, func) {
        if (typeof elem.removeEventListener !== "undefined") {
            elem.removeEventListener(evnt, func, false);
        } else if (typeof elem.detachEvent !== "undefined") {
            elem.detachEvent('on'+evnt, func);
        }
    }
};