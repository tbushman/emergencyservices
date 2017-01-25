/// <reference path="../Panel/Panel.ts"/>
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE in the project root for license information.
"use strict";
var fabric;
(function (fabric) {
    var DROPDOWN_CLASS = "ms-Dropdown";
    var DROPDOWN_TITLE_CLASS = "ms-Dropdown-title";
    var DROPDOWN_ITEMS_CLASS = "ms-Dropdown-items";
    var DROPDOWN_ITEM_CLASS = "ms-Dropdown-item";
    var DROPDOWN_SELECT_CLASS_SELECTOR = ".ms-Dropdown-select";
    var PANEL_CLASS = "ms-Panel";
    var IS_OPEN_CLASS = "is-open";
    var IS_DISABLED_CLASS = "is-disabled";
    var IS_SELECTED_CLASS = "is-selected";
    var ANIMATE_IN_CLASS = "animate-in";
    var SMALL_MAX_WIDTH = 479;
    /**
     * Dropdown Plugin
     *
     * Given .ms-Dropdown containers with generic <select> elements inside, this plugin hides the original
     * dropdown and creates a new "fake" dropdown that can more easily be styled across browsers.
     *
     */
    var Dropdown = (function () {
        /**
         *
         * @param {HTMLElement} container - the target container for an instance of Dropdown
         * @constructor
         */
        function Dropdown(container) {
            this._container = container;
            this._newDropdownLabel = document.createElement("span");
            this._newDropdownLabel.classList.add(DROPDOWN_TITLE_CLASS);
            this._newDropdown = document.createElement("ul");
            this._newDropdown.classList.add(DROPDOWN_ITEMS_CLASS);
            this._dropdownItems = [];
            this._originalDropdown = container.querySelector(DROPDOWN_SELECT_CLASS_SELECTOR);
            var _originalOptions = this._originalDropdown.querySelectorAll("option");
            /** Bind the callbacks to retain their context */
            this._onCloseDropdown = this._onCloseDropdown.bind(this);
            this._onItemSelection = this._onItemSelection.bind(this);
            this._onOpenDropdown = this._onOpenDropdown.bind(this);
            /** Create a new option as a list item, and add it to the replacement dropdown */
            for (var i = 0; i < _originalOptions.length; ++i) {
                var option = _originalOptions[i];
                if (option.selected) {
                    this._newDropdownLabel.innerHTML = option.text;
                }
                var newItem = document.createElement("li");
                newItem.classList.add(DROPDOWN_ITEM_CLASS);
                if (option.disabled) {
                    newItem.classList.add(IS_DISABLED_CLASS);
                }
                newItem.innerHTML = option.text;
                newItem.addEventListener("click", this._onItemSelection);
                this._newDropdown.appendChild(newItem);
                this._dropdownItems.push({
                    oldOption: option,
                    newItem: newItem
                });
            }
            /** Add the new replacement dropdown */
            container.appendChild(this._newDropdownLabel);
            container.appendChild(this._newDropdown);
            /** Toggle open/closed state of the dropdown when clicking its title. */
            this._newDropdownLabel.addEventListener("click", this._onOpenDropdown);
            this._setWindowEvent();
        }
        Dropdown.prototype._setWindowEvent = function () {
            var _this = this;
            window.addEventListener("resize", function () {
                _this._doResize();
            }, false);
        };
        Dropdown.prototype._getScreenSize = function () {
            var w = window;
            var wSize = {
                x: 0,
                y: 0
            };
            var d = document, e = d.documentElement, g = d.getElementsByTagName("body")[0];
            wSize.x = w.innerWidth || e.clientWidth || g.clientWidth;
            wSize.y = w.innerHeight || e.clientHeight || g.clientHeight;
            return wSize;
        };
        Dropdown.prototype._doResize = function () {
            var isOpen = this._container.classList.contains(IS_OPEN_CLASS);
            if (!isOpen) {
                return;
            }
            var screenSize = this._getScreenSize().x;
            if (screenSize <= SMALL_MAX_WIDTH) {
                this._openDropdownAsPanel();
            }
            else {
                this._removeDropdownAsPanel();
            }
        };
        Dropdown.prototype._openDropdownAsPanel = function () {
            if (this._panel === undefined) {
                this._panelContainer = document.createElement("div");
                this._panelContainer.classList.add(PANEL_CLASS);
                this._panelContainer.classList.add(DROPDOWN_CLASS);
                this._panelContainer.classList.add(IS_OPEN_CLASS);
                this._panelContainer.classList.add(ANIMATE_IN_CLASS);
                this._panelContainer.appendChild(this._newDropdown);
                /** Assign the script to the new panel, which creates a panel host, overlay, and attaches it to the DOM */
                this._panel = new fabric.Panel(this._panelContainer);
            }
        };
        Dropdown.prototype._removeDropdownAsPanel = function () {
            var _this = this;
            if (this._panel !== undefined) {
                /** destroy panel and move dropdown back to outside the panel */
                this._panel.dismiss(function () {
                    _this._container.appendChild(_this._newDropdown);
                });
                this._panel = undefined;
            }
        };
        Dropdown.prototype._onOpenDropdown = function (evt) {
            var isDisabled = this._container.classList.contains(IS_DISABLED_CLASS);
            var isOpen = this._container.classList.contains(IS_OPEN_CLASS);
            if (!isDisabled && !isOpen) {
                /** Stop the click event from propagating, which would just close the dropdown immediately. */
                evt.stopPropagation();
                /** Go ahead and open that dropdown. */
                this._container.classList.add(IS_OPEN_CLASS);
                /** Temporarily bind an event to the document that will close this dropdown when clicking anywhere. */
                document.addEventListener("click", this._onCloseDropdown);
                var screenSize = this._getScreenSize().x;
                if (screenSize <= SMALL_MAX_WIDTH) {
                    this._openDropdownAsPanel();
                }
            }
        };
        Dropdown.prototype._onCloseDropdown = function () {
            this._removeDropdownAsPanel();
            this._container.classList.remove(IS_OPEN_CLASS);
            document.removeEventListener("click", this._onCloseDropdown);
        };
        Dropdown.prototype._onItemSelection = function (evt) {
            var item = evt.target;
            var isDropdownDisabled = this._container.classList.contains(IS_DISABLED_CLASS);
            var isOptionDisabled = item.classList.contains(IS_DISABLED_CLASS);
            if (!isDropdownDisabled && !isOptionDisabled) {
                /** Deselect all items and select this one. */
                /** Update the original dropdown. */
                for (var i = 0; i < this._dropdownItems.length; ++i) {
                    if (this._dropdownItems[i].newItem === item) {
                        this._dropdownItems[i].newItem.classList.add(IS_SELECTED_CLASS);
                        this._dropdownItems[i].oldOption.selected = true;
                    }
                    else {
                        this._dropdownItems[i].newItem.classList.remove(IS_SELECTED_CLASS);
                        this._dropdownItems[i].oldOption.selected = false;
                    }
                }
                /** Update the replacement dropdown's title. */
                this._newDropdownLabel.innerHTML = item.textContent;
                /** Trigger any change event tied to the original dropdown. */
                var changeEvent = document.createEvent("HTMLEvents");
                changeEvent.initEvent("change", false, true);
                this._originalDropdown.dispatchEvent(changeEvent);
            }
        };
        return Dropdown;
    }());
    fabric.Dropdown = Dropdown;
})(fabric || (fabric = {}));
