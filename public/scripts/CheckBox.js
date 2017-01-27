// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE in the project root for license information.
"use strict";
var fabric;
(function (fabric) {
    /**
     * CheckBox Plugin
     *
     * Adds basic demonstration functionality to .ms-CheckBox components.
     *
     */
    var CheckBox = (function () {
        /**
         *
         * @param {HTMLElement} container - the target container for an instance of CheckBox
         * @constructor
         */
        function CheckBox(container) {
            this._container = container;
            this._choiceField = this._container.querySelector(".ms-CheckBox-field");
            this._choiceInput = this._container.querySelector(".ms-CheckBox-input");
            if (this._choiceInput.checked) {
                this._choiceField.setAttribute("aria-checked", "true");
            }
            if (this._choiceField.getAttribute("aria-checked") === "true") {
                this._choiceField.classList.add("is-checked");
            }
            this._addListeners();
        }
        CheckBox.prototype.getValue = function () {
            return this._choiceField.getAttribute("aria-checked") === "true" ? true : false;
        };
        CheckBox.prototype.toggle = function () {
            if (this.getValue()) {
                this.unCheck();
            }
            else {
                this.check();
            }
            this._choiceInput.click();
        };
        CheckBox.prototype.check = function () {
            this._choiceField.setAttribute("aria-checked", "true");
            this._choiceField.classList.add("is-checked");
        };
        CheckBox.prototype.unCheck = function () {
            this._choiceField.setAttribute("aria-checked", "false");
            this._choiceField.classList.remove("is-checked");
        };
        CheckBox.prototype.removeListeners = function () {
            this._choiceField.removeEventListener("focus", this._FocusHandler.bind(this));
            this._choiceField.removeEventListener("blur", this._BlurHandler.bind(this));
            this._choiceField.removeEventListener("click", this._ClickHandler.bind(this));
            this._choiceField.addEventListener("keydown", this._KeydownHandler.bind(this));
        };
        CheckBox.prototype._addListeners = function (events) {
            var ignore = events && events.ignore;
            if (!ignore || !(ignore.indexOf("focus") > -1)) {
                this._choiceField.addEventListener("focus", this._FocusHandler.bind(this), false);
            }
            if (!ignore || !(ignore.indexOf("blur") > -1)) {
                this._choiceField.addEventListener("blur", this._BlurHandler.bind(this), false);
            }
            if (!ignore || !(ignore.indexOf("click") > -1)) {
                this._choiceField.addEventListener("click", this._ClickHandler.bind(this), false);
            }
            if (!ignore || !(ignore.indexOf("keydown") > -1)) {
                this._choiceField.addEventListener("keydown", this._KeydownHandler.bind(this), false);
            }
        };
        CheckBox.prototype._FocusHandler = function () {
            this._choiceField.classList.add("in-focus");
        };
        CheckBox.prototype._BlurHandler = function () {
            this._choiceField.classList.remove("in-focus");
        };
        CheckBox.prototype._ClickHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            if (!this._choiceField.classList.contains("is-disabled")) {
                this.toggle();
            }
        };
        CheckBox.prototype._KeydownHandler = function (event) {
            if (event.keyCode === 32) {
                event.stopPropagation();
                event.preventDefault();
                if (!this._choiceField.classList.contains("is-disabled")) {
                    this.toggle();
                }
            }
        };
        return CheckBox;
    }());
    fabric.CheckBox = CheckBox;
})(fabric || (fabric = {}));
