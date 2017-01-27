// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE in the project root for license information.
/// <reference path="../CheckBox/CheckBox.ts"/>
"use strict";
var fabric;
(function (fabric) {
    /**
     * RadioButton Plugin
     *
     * Adds basic demonstration functionality to .ms-RadioButton components.
     *
     */
    var RadioButton = (function () {
        /**
         *
         * @param {HTMLElement} container - the target container for an instance of RadioButton
         * @constructor
         */
        function RadioButton(container) {
            this._container = container;
            this._choiceField = this._container.querySelector(".ms-RadioButton-field");
            this._choiceInput = this._container.querySelector(".ms-RadioButton-input");
            if (this._choiceField.getAttribute("aria-checked") === "true") {
                this._choiceField.classList.add("is-checked");
            }
            this._addListeners();
        }
        RadioButton.prototype.getValue = function () {
            return this._choiceField.getAttribute("aria-checked") === "true" ? true : false;
        };
        RadioButton.prototype.toggle = function () {
            if (this.getValue()) {
                this.unCheck();
            }
            else {
                this.check();
            }
        };
        RadioButton.prototype.check = function () {
            this._choiceField.setAttribute("aria-checked", "true");
            this._choiceField.classList.add("is-checked");
            this._choiceInput.checked = true;
        };
        RadioButton.prototype.unCheck = function () {
            this._choiceField.setAttribute("aria-checked", "false");
            this._choiceField.classList.remove("is-checked");
            this._choiceInput.checked = false;
        };
        RadioButton.prototype.removeListeners = function () {
            this._choiceField.removeEventListener("focus", this._FocusHandler.bind(this));
            this._choiceField.removeEventListener("blur", this._BlurHandler.bind(this));
            this._choiceField.removeEventListener("click", this._RadioClickHandler.bind(this));
            this._choiceField.addEventListener("keydown", this._RadioKeydownHandler.bind(this));
        };
        RadioButton.prototype._addListeners = function () {
            this._choiceField.addEventListener("focus", this._FocusHandler.bind(this), false);
            this._choiceField.addEventListener("blur", this._BlurHandler.bind(this), false);
            this._choiceField.addEventListener("click", this._RadioClickHandler.bind(this), false);
            this._choiceField.addEventListener("keydown", this._RadioKeydownHandler.bind(this), false);
        };
        RadioButton.prototype._RadioClickHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            if (!this._choiceField.classList.contains("is-disabled")) {
                this._dispatchSelectEvent();
            }
        };
        RadioButton.prototype._dispatchSelectEvent = function () {
            var objDict = {
                bubbles: true,
                cancelable: true,
                detail: {
                    name: this._choiceField.getAttribute("name"),
                    item: this
                }
            };
            this._choiceField.dispatchEvent(new CustomEvent("msChoicefield", objDict));
        };
        RadioButton.prototype._RadioKeydownHandler = function (event) {
            if (event.keyCode === 32) {
                event.stopPropagation();
                event.preventDefault();
                if (!this._choiceField.classList.contains("is-disabled")) {
                    this._dispatchSelectEvent();
                }
            }
        };
        RadioButton.prototype._FocusHandler = function () {
            this._choiceField.classList.add("in-focus");
        };
        RadioButton.prototype._BlurHandler = function () {
            this._choiceField.classList.remove("in-focus");
        };
        return RadioButton;
    }());
    fabric.RadioButton = RadioButton;
})(fabric || (fabric = {}));
