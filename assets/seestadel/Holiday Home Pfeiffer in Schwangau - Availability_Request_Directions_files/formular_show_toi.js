if (typeof FormularWidgetHelperShow != "function") {

    // Global variables
    var formularWidgetHelper_requiredError =
        "Bitte füllen Sie die mit * gekennzeichneten Pflichtfelder aus.";
    var formularWidgetHelper_emailError = null;
    var formularWidgetHelper_dateError = null;

    FormularWidgetHelperShow = Class.create({
        style: "",
        forms: null,
        buttonText: null,
        requiredText: null,

        initToiShowForm: function(buttonText, requiredText, requiredError, emailError,
            dateError) {
            this.style = "toi";
            this.forms = new Object();
            this.buttonText = buttonText;
            this.requiredText = requiredText;
            formularWidgetHelper_requiredError = requiredError;
            formularWidgetHelper_emailError = emailError;
            formularWidgetHelper_dateError = dateError;
        },

        /**
		mode = preview|show
	*/
        getForm: function(id, newsletter, mode) {
            // Dont cache the document
            window["formular_widget_show_" + id].doRequest(
                "", {
                    // contentType : "application/x-www-form-urlencoded",
                    method: "get",
                    parameters: {
                        subaction: "getForm"
                    },
                    onSuccess: this.onGetForm.bind(this, id, newsletter, mode)
                }, {}, true);
        },

        /**
		mode = preview|show
	*/
        onGetForm: function(id, newsletter, mode, res) {
            var doc = res.responseXML;
            if (!doc || doc == null) {
                alert("onGetForm: doc is null for id " + id);
                return;
            }

            var fid = doc.documentElement.getAttribute("formularId");
            if (!fid || fid == "") {
                alert("onGetForm: formularId is null for doc id " + id);
                return;
            }

            // to avoid being loaded a second time, save reference here.
            this.forms[fid] = doc;
            this.form2Html(fid, newsletter, mode);
            var i;
            for (i = 0; i < frames.length; i++) {
                if (frames[i].widgetInstance) {
                    try {
                        var wf = frames[i].widgetInstance.popupHandler.ref.widgetFrame;
                        Common.log("Call updateContent ");
                        wf.contentChanged.call(wf);
                        break;
                    } catch (e) {
                        Common.log(e);
                    }
                }
            }
        },

        /**
         * Methods to draw a form
         * mode = preview|show
         */
        form2Html: function(formularId, newsletter, mode) {
            var doc = this.forms[formularId];
            var type = doc.documentElement.getAttribute("type");
            var inputElements = doc.getElementsByTagName("input");
            if (!inputElements) {
                $(formularId).innerHTML = "Das Formular hat keine Felder";
                return;
            }
            var outputDiv = $(formularId);
            if (outputDiv.innerHTML) {
                /* formular is already rendered */
                return;
            }

            var form = FORM({
                attributes: {
                    "id": formularId + "_form"
                }
            });
            var table = TABLE({classes: ["w_body_table"], styles: {width: "100%"}});
            var tbody = TBODY({});
			var colgroup = COLGROUP({},
				COL({attributes: {width: "140"}}),
				COL({attributes: {width: "*"}})
			);

            var colspan = "2";

            // error status (will be set later when calling canSubmit())
            var errorText = "";

            tbody.appendChild(TR({},
                TD({
                        attributes: {
                            "colspan": "2"
                        }
                    },
                    DIV({
                            attributes: {
                                id: formularId + "_error"
                            }
                        },
                        B(TEXT(errorText))
                    )
                )
            ));

            // BUGFIX / WORKAROUND: I could not get IE to check the "default checkboxes".
            //  So collect checkboxes, and check them once they have been rendered in the dom.
            var checkBoxesSetToTrue = [];
            for (var i = 0; i < inputElements.length; i++) {
                // $(formularId).innerHTML += inputElements[i].getAttribute("ref")+"<br/>";
                var celem = inputElements[i];
                this.inputElemToHtml(formularId, form, tbody, celem);

                // its a checkbox, and its supposed to be checked by default 
                if (celem.getAttribute("type") == "xsd:boolean" && widgets_utils_getText(celem,
                    "value") == "true") {
                    checkBoxesSetToTrue.push(celem.getAttribute("ref")); // collect its id
                }
            }

			table.appendChild(colgroup);
            table.appendChild(tbody);
            form.appendChild(table);
            outputDiv.appendChild(form);

            // WORKAROUND continued. Everything is in the DOM, now walk through the ids of the default-on checkboxes, and check them.
            for (var i = 0; i < checkBoxesSetToTrue.length; i++) {
                $(checkBoxesSetToTrue[i]).checked = "checked";
            }

            if (mode && mode == "show") { // do not show send button in preview mode
                var text = TEXT("Absenden");
                if (this.buttonText && !this.buttonText == "")
                    text = TEXT(this.buttonText);

                var requiredText = "";
                if (this.requiredText && !this.requiredText == "")
                    requiredText = this.requiredText;

                var divLeft = document.createElement("div");
                divLeft.setAttribute("style", "float:left");
                var divRight = document.createElement("div");
                divRight.setAttribute("style", "float:right");
                var button = BUTTON({
                        styles: {
                            "marginTop": "10px",
                            "marginBottom": "15px"
                        },
                        events: {
                            'onclick': window.formular_widget_helper.submitForm.bind(this,
                                formularId)
                        }
                    },
                    text
                );
                var requiredTextEl = TEXT(requiredText);
                divLeft.appendChild(button);
                divRight.appendChild(requiredTextEl);

                tbody.appendChild(
                    TR({},
                        TD(),
                        TD({},
                            DIV({},
                                divLeft,
                                divRight
                            )
                        )
                    )
                );
            }
        },

        /**
         * form : the form js object to append functions to
         * parentElem : a TBODY HTML element
         * inputElem : the DOM Element representing an Input field.
         */
        inputElemToHtml: function(formularId, form, parentElem, inputElem) {
            // get the LABEL element for the text to display
            var labelText = widgets_utils_getText(inputElem, "label");
            var isNewsletter = (inputElem.getAttribute("ref") == "newsletter");

            var tr = TR({
                attributes: {
                    id: form.id + "_tr_" + inputElem.getAttribute("ref")
                }
            });

            // get the type of the element
            var type = inputElem.getAttribute("type");
            if (!type || type == "")
                type = "text"; // the default is an plain text input field

            // create an Object to hold the inputElement
            var theInputElem = null;
            // check if it is required, we need this before we create the actual input element
            var isRequired = this.inputElemIsRequired(inputElem);

            // TD , hidden Input for the label and the type
            var labeltd;
            tr.appendChild(
                labeltd = TD({
                        classes: ["w_td_label_" + formularId],
                        attributes: {
                            valign: "top"
                        }
                    },
                    SPAN({
                            attributes: {
                                id: form.id + "_textspan_" + inputElem.getAttribute("ref")
                            }
                        },
                        TEXT(labelText + (isNewsletter ? "" : ":" + (isRequired ? " *" : "")))
                    ),
                    INPUT({
                        attributes: {
                            "type": "hidden",
                            "name": "label_" + inputElem.getAttribute("ref"),
                            "value": labelText
                        }
                    }),
                    INPUT({
                        attributes: {
                            "type": "hidden",
                            "name": "type_" + inputElem.getAttribute("ref"),
                            "value": type
                        }
                    })
                )
            );

            // Label formatting
            var labelFormat = "";
            if (inputElem.getAttribute("fontname"))
                labelFormat += "font-family:" + inputElem.getAttribute("fontname") + "; ";
            if (inputElem.getAttribute("fontsize"))
                labelFormat += "font-size:" + inputElem.getAttribute("fontsize") + "; ";
            if (inputElem.getAttribute("fontcolor"))
                labelFormat += "color:" + inputElem.getAttribute("fontcolor") + "; ";
            labeltd.setStyle(labelFormat);

            theInputElem = this.createInputElem(inputElem, false, labelFormat);
            // for newsletter checkbox: print checkbox left instead of into the second TD.
            if (isNewsletter) {
                theInputElem.checked = false;
                labeltd.colSpan = 2;
                labeltd.insertBefore(theInputElem, labeltd.firstChild);
                theInputElem.style.marginRight = '4px';
            } else {
                tr.appendChild(TD({
                    attributes: {
                        valign: "top",
                        style: labelFormat
                    }
                }, theInputElem));
            }
            parentElem.appendChild(tr);
        },

        /**
         * TODO/FIXME : width of the input elements "text" and "textarea" depend
         * on wethers "isPreviews" is true/false. These values should go into css anyway.
         */
        createInputElem: function(inputElem, isPreview, labelFormat) {
            var theInputElem = null;
            var textWidth = "100%";
            // the narrow one for the formular config dialog 
            var isRequired = this.inputElemIsRequired(inputElem);
            var type = inputElem.getAttribute("type") || "text";

            if (type == "text") {
                theInputElem = INPUT({
                    classes: ["cw_input"],
                    attributes: {
                        "type": "text",
                        "name": "value_" + inputElem.getAttribute("ref"),
                        "value": widgets_utils_getText(inputElem, "value"),
                        "cm_type": "text",
                        "style": "width:" + textWidth + "; " + labelFormat
                    }
                });
            } else if (type == "email") {
                theInputElem = INPUT({
                    classes: ["cw_input"],
                    attributes: {
                        "type": "text",
                        "name": "value_" + inputElem.getAttribute("ref"),
                        "value": widgets_utils_getText(inputElem, "value"),
                        "cm_type": "email",
                        "style": "width:" + textWidth + "; " + labelFormat
                    }
                });
            } else if (type == "xsd:integer") {
                theInputElem = INPUT({
                    classes: ["cw_input"],
                    attributes: {
                        "type": "number",
                        "name": "value_" + inputElem.getAttribute("ref"),
                        "value": widgets_utils_getText(inputElem, "value"),
                        "cm_type": "xsd:integer",
                        "style": labelFormat,
                        "size": "5" /* (PBT: #10953) ensure 5 digits for postal code */
                    }
                });
            } else if (type == "xsd:date") {
                theInputElem = SPAN({
                    styles: {
                        padding: '0'
                    }
                });
                var date = new Date();
                var year = date.getFullYear();
                var defaultValue = this.getDateFromValue(widgets_utils_getText(inputElem,
                    "value"));
                var defaultDay = "",
                    defaultMonth = "",
                    defaultYear = "";
                if (defaultValue) {
                    defaultDay = defaultValue.day;
                    defaultMonth = defaultValue.month;
                    defaultYear = defaultValue.year;
                }
                theInputElem.appendChild(this.makeIntSelectElem("day_" + inputElem.getAttribute(
                    "ref"), 1, 31, 1, 2, defaultDay, labelFormat));
                theInputElem.appendChild(SPAN({
                    styles: {
                        margin: '0 3px 0 0',
                        padding: '0'
                    }
                }, "."));
                theInputElem.appendChild(this.makeIntSelectElem("month_" + inputElem.getAttribute(
                    "ref"), 1, 12, 1, 2, defaultMonth, labelFormat));
                theInputElem.appendChild(SPAN({
                    styles: {
                        margin: '0 3px 0 0',
                        padding: '0'
                    }
                }, "."));
                theInputElem.appendChild(this.makeIntSelectElem("year_" + inputElem.getAttribute(
                    "ref"), 1900, 151, 1, 4, defaultYear, labelFormat)); /* 1900 - 2050 */
            } else if (type == "xsd:time") {
                theInputElem = SPAN({
                    styles: {
                        padding: '0'
                    }
                });
                var defaultValue = this.getTimeFromValue(widgets_utils_getText(inputElem,
                    "value"));
                var defaultHour = "",
                    defaultMinute = "";
                if (defaultValue) {
                    defaultHour = defaultValue.hour;
                    defaultMinute = defaultValue.minute;
                }
                theInputElem.appendChild(this.makeIntSelectElem("hour_" + inputElem.getAttribute(
                    "ref"), 0, 24, 1, 2, defaultHour, labelFormat));
                theInputElem.appendChild(SPAN({
                    styles: {
                        margin: '0 3px 0 0',
                        padding: '0'
                    }
                }, ":"));
                theInputElem.appendChild(this.makeIntSelectElem("minute_" + inputElem.getAttribute(
                    "ref"), 0, 59, 15, 2, defaultMinute, labelFormat));
            } else if (type == "textarea") {
                theInputElem = TEXTAREA({
                        classes: ["cw_input"],
                        attributes: {
                            "name": "value_" + inputElem.getAttribute("ref"),
                            "cm_type": "textarea",
                            "style": "width:" + textWidth + "; height:80px; " + labelFormat
                        }
                    },
                    TEXT(widgets_utils_getText(inputElem, "value"))
                );
            } else if (type == "xsd:boolean") {
                theInputElem = new Element("input", {
                    "type": "checkbox",
                    "name": "value_" + inputElem.getAttribute("ref"),
                    "id": inputElem.getAttribute("ref"),
                    "cm_type": "xsd:boolean",
                    "class": "cw_input"
                });

                // TODO / Helpme : the "theInputElem.checked = true" does not work with IE. I dont know why. Workaround
                // is in this.form2html for IE
                if (widgets_utils_getText(inputElem, "value") == "true")
                    theInputElem.checked = true;

            } else if (type == "select") {
                theInputElem = this.makeSelectElement(inputElem, labelFormat);
                theInputElem.writeAttribute("cm_type", "select");
            } else if (type == "radiogroup") {
                theInputElem = this.makeRadiogroupElement(inputElem);
                theInputElem.writeAttribute("cm_type", "select");
            }

            if (isPreview) {
                if (type == "text" || type == "textarea" || type == "xsd:boolean") {
                    theInputElem.onfocus = function() {
                        this.blur();
                    };
                }
                if (type == "xsd:boolean") {
                    theInputElem.onclick = function() {
                        return false;
                    };
                }
            }

            // Error handling:
            // canSubmit returns null if input is okay and form can be submitted, otherwise it returns the error message to be displayed
            if (type == "xsd:boolean") {
                if (isRequired) {
                    theInputElem.cm_required = true;
                    theInputElem.setAttribute("aria-required", "true");
                    theInputElem.canSubmit = function() {
                        return (this.checked ? null : formularWidgetHelper_requiredError);
                    };
                } else {
                    theInputElem.cm_required = false;
                    theInputElem.canSubmit = function() {
                        return null;
                    };
                }
            } else if (type == "xsd:time") {
                var selects = $A(theInputElem.getElementsByTagName('select'));
                selects.each(function(sel, i) {
                    sel.writeAttribute("cm_type", type);
                    sel.subfield = (i + 1);
                    sel.cm_required = isRequired;
                    if (isRequired) {
                        sel.setAttribute("aria-required", "true");
                        sel.canSubmit = function() {
                            return (this.value == null || this.value == "" ?
                                formularWidgetHelper_requiredError : null);
                        };
                    } else {
                        sel.canSubmit = function() {
                            return null;
                        };
                    }
                });
            } else if (type == "xsd:date") {
                var selects = $A(theInputElem.getElementsByTagName('select'));
                selects.each(function(sel, i) {
                    sel.writeAttribute("cm_type", type);
                    sel.subfield = (i + 1);
                    sel.cm_required = isRequired;
                    if (isRequired) {
                        sel.setAttribute("aria-required", "true");
                        sel.canSubmit = function() {
                            if (this.value == null || this.value == "")
                                return formularWidgetHelper_requiredError; // incomplete date given
                            var day = parseInt($(this.form).select("*[name='day_" + inputElem
                                .getAttribute("ref") + "']").first().value);
                            var month = parseInt($(this.form).select("*[name='month_" + inputElem
                                .getAttribute("ref") + "']").first().value);
                            var year = parseInt($(this.form).select("*[name='year_" + inputElem
                                .getAttribute("ref") + "']").first().value);
                            var date = new Date(year, month - 1, day); // month is 0-indexed
                            if (date.getDate() != day)
                                return formularWidgetHelper_dateError; // invalid date given
                            return null; // valid date given
                        };
                    } else {
                        sel.canSubmit = function() {
                            var day = $(this.form).select("*[name='day_" + inputElem.getAttribute(
                                "ref") + "']").first().value;
                            var month = $(this.form).select("*[name='month_" + inputElem.getAttribute(
                                "ref") + "']").first().value;
                            var year = $(this.form).select("*[name='year_" + inputElem.getAttribute(
                                "ref") + "']").first().value;
                            if (day == "" && month == "" && year == "")
                                return null; // no date given
                            var date = new Date(parseInt(year), parseInt(month) - 1,
                                parseInt(day)); // month is 0-indexed
                            if (date.getDate() != day)
                                return formularWidgetHelper_dateError; // invalid or incomplete date given
                            return null; // valid date given
                        };
                    }
                });
            } else if (type == "email") {
                if (isRequired) {
                    theInputElem.cm_required = true;
                    theInputElem.setAttribute("aria-required", "true");
                    theInputElem.canSubmit = function() {
                        return (this.value == null || this.value == "" ?
                            formularWidgetHelper_requiredError : (!this.value.match(
                                    /^[^@ ]+@[^@ ]+\.[^@. ]+$/) ?
                                formularWidgetHelper_emailError : null));
                    };
                } else {
                    theInputElem.cm_required = false;
                    theInputElem.canSubmit = function() {
                        return (this.value != null && this.value != "" && !this.value.match(
                                /^[^@ ]+@[^@ ]+\.[^@. ]+$/) ? formularWidgetHelper_emailError :
                            null);
                    };
                }
            } else if (type == "radiogroup") {
                if (isRequired) {
                    theInputElem.cm_required = true;
                    theInputElem.setAttribute("aria-required", "true");
                    var radiobuttons = theInputElem.getElementsByTagName("input");
                    for (var i = 0; i < radiobuttons.length; i++) {
                        radiobuttons[i].canSubmit = function() {
                            var radiobuttons0 = this.parentNode.getElementsByTagName("input");
                            var atLeastOneSelected = false;
                            for (var j = 0; j < radiobuttons0.length && !atLeastOneSelected; j++) {
                                atLeastOneSelected = radiobuttons0[j].checked;
                            }
                            if (atLeastOneSelected)
                                return null;
                            else
                                return (formularWidgetHelper_requiredError);
                        };
                    }
                } else {
                    theInputElem.cm_required = false;
                    theInputElem.canSubmit = function() {
                        return null;
                    };
                }
            } else {
                if (isRequired) {
                    theInputElem.cm_required = true;
                    theInputElem.setAttribute("aria-required", "true");
                    theInputElem.canSubmit = function() {
                        return (this.value == null || this.value == "" ?
                            formularWidgetHelper_requiredError : null);
                    };
                } else {
                    theInputElem.cm_required = false;
                    theInputElem.canSubmit = function() {
                        return null;
                    };
                }
            }

            return theInputElem;
        },

        makeSelectElement: function(inputElem, format) {
            format = format || "";
            var selectedValue = widgets_utils_getText(inputElem, "value");
            var select = SELECT({
                    classes: ["cw_select"],
                    attributes: {
                        "name": "value_" + inputElem.getAttribute("ref"),
                        "size": "1",
                        "value": selectedValue,
                        "style": format
                    }
                },
                OPTION({
                    attributes: {
                        value: ""
                    }
                }, TEXT("- bitte wählen -"))
            );
            var items = inputElem.getElementsByTagName("item");
            for (var i = 0; i < items.length; i++) {
                var label = widgets_utils_getText(items[i], "label");
                var value = widgets_utils_getText(items[i], "value");
                var option = null;
                if (value == selectedValue)
                    option = OPTION({
                        attributes: {
                            value: value,
                            selected: "selected"
                        }
                    }, TEXT(label));
                else
                    option = OPTION({
                        attributes: {
                            value: value
                        }
                    }, TEXT(label));
                select.appendChild(option);
            }
            return select;
        },

        makeRadiogroupElement: function(inputElem) {
            var selectedValue = widgets_utils_getText(inputElem, "value");
            var div = DIV({
                classes: ["cw_radiogroup"]
            });
            var items = inputElem.getElementsByTagName("item");
            for (var i = 0; i < items.length; i++) {
                var label = widgets_utils_getText(items[i], "label");
                var value = widgets_utils_getText(items[i], "value");
                var input = null;
                if (value == selectedValue)
                    input = INPUT({
                        attributes: {
                            type: "radio",
                            cm_type: "radiobutton",
                            name: "value_" + inputElem.getAttribute("ref"),
                            id: inputElem.getAttribute("ref") + "_" + i,
                            value: value,
                            checked: "checked"
                        }
                    });
                else
                    input = INPUT({
                        attributes: {
                            type: "radio",
                            cm_type: "radiobutton",
                            name: "value_" + inputElem.getAttribute("ref"),
                            id: inputElem.getAttribute("ref") + "_" + i,
                            value: value
                        }
                    });
                div.appendChild(input);
                var labelElem = LABEL({
                    attributes: {
                        "for": inputElem.getAttribute("ref") + "_" + i
                    }
                }, TEXT(label));
                div.appendChild(labelElem);
                var br = BR();
                div.appendChild(br);
            }
            return div;
        },

        makeIntSelectElem: function(name, startNum, length, step, paddedLength, value, format) {
            step = step || 1;
            format = format || "";

            var select = SELECT({
                    classes: ["cw_select"],
                    attributes: {
                        "name": name,
                        "value": value,
                        size: "1",
                        style: format
                    }
                },
                OPTION({
                    attributes: {
                        value: ""
                    }
                }, TEXT(paddedLength ? "-".times(paddedLength) : "--"))
            );
            for (var i = startNum; i < (startNum + length); i += step) {
                if (value && value != "" && i == value)
                    select.appendChild(OPTION({
                        attributes: {
                            value: "" + i,
                            selected: "selected"
                        }
                    }, TEXT((paddedLength ? (i).toPaddedString(paddedLength) : "" + i))));
                else
                    select.appendChild(OPTION({
                        attributes: {
                            value: "" + i
                        }
                    }, TEXT((paddedLength ? (i).toPaddedString(paddedLength) : "" + i))));
            }
            return select;
        },

        inputElemIsRequired: function(inputElem) {
            var required = inputElem.getAttribute("cm_required");
            var isRequired = (required && required == "true()");
            return isRequired;
        },

        getDateFromValue: function(value) {
            var values = value.split(".");
            if (values.length != 3)
                return null;
            return {
                day: values[0],
                month: values[1],
                year: values[2]
            };
        },

        getTimeFromValue: function(value) {
            var values = value.split(":");
            if (values.length != 2)
                return null;
            return {
                hour: values[0],
                minute: values[1]
            };
        },

        /*
         * Called when the form is submitted from the published page
         */
        submitForm: function(formularId) {
            // alert( "submitForm:" + formularId +"#" + window["formular_widget_show_"+ formularId] );
            var theform = $(formularId + "_form"); // see form2html , where this has been set
            var formElems = Form.getElements(theform);
            var theParameters = new Hash();
            var str = "";

            var errorText = $(formularId + "_error").firstChild.firstChild;
            var errorDiv = $(formularId + "_error");
            errorText.nodeValue = "";
            errorDiv.removeClassName("cw_error_msg");

            theParameters.set("subaction", "submitFormular");

            var cansubmit = true;
            for (var i = 0; i < formElems.length; i++) {
                // required flag is set in inputElemToHtml.
                // its not working for multiple selects as of now
                var formElem = formElems[i];
                var type = formElem.readAttribute("cm_type");
                var name = formElem.name;

                if (!formElem.name)
                    continue;

                if (type)
                    name = name.substring(name.indexOf("_") + 1);
                var textSpan = $(formularId + "_form_textspan_" + name);
                var tr = $(formularId + "_form_tr_" + name);

                if (formElem.canSubmit) { /* formElem has an error function */
                    var error = formElem.canSubmit();

                    if (error && error != "") { /* error occured in formElem */
                        tr.addClassName("cw_error");
                        errorText.nodeValue = error;
                        errorDiv.addClassName("cw_error_msg");
                        cansubmit = false;
                    } else if (!formElem.subfield || formElem.subfield == 1)
                        tr.removeClassName("cw_error");
                }

                if (type && type == "xsd:boolean") {
                    // TODO : i18n
                    theParameters.set(formElem.name, (formElem.checked ? "Ja" : "Nein"));
                } else if (type && type == "radiobutton") {
                    if (formElem.checked)
                        theParameters.set(formElem.name, formElem.value || "");
                } else {
                    theParameters.set(formElem.name, formElem.value || "");
                }
            }

            if (!cansubmit) {
                $(formularId + "_error").style.display = "block";
                return false;
            } else {
                $(formularId + "_error").style.display = "none";
            }

            theParameters.set("__host__", window.location.hostname);

            window["formular_widget_show_" + formularId].doRequest(
                "", {
                    method: "post",
                    contentType: "application/x-www-form-urlencoded",
                    parameters: theParameters,
                    onSuccess: window.formular_widget_helper.onSubmitFormular.bind(this,
                        formularId)
                }, {}, true);

            return false;
        },

        onSubmitFormular: function(formularId, res) {
            var resDivInnerHTML = "";
            resDivInnerHTML += "<h2 class='cm-h1'>";
            resDivInnerHTML += res.responseText;
            resDivInnerHTML +=
                "&nbsp;&nbsp;<a onclick='window.formular_widget_helper.reshowForm(\"" + formularId
                + "\" );' href='javascript:void(0);'>Ok</a>";
            resDivInnerHTML += "</h2><br/>";

            $(formularId + "_answertext").innerHTML = resDivInnerHTML;
            $(formularId).style.display = "none";
            $(formularId + "_introtext").style.display = "none";
        },

        reshowForm: function(formularId) {
            // Empty inputs
            var theform = $(formularId + "_form"); // see form2html , where this has been set
            var formElems = Form.getElements(theform);
            for (var i = 0; i < formElems.length; i++) {
                var formElem = formElems[i];
                if (!(""+formElem.name).startsWith("value_")) {
                    continue;
                }
                var type = formElem.readAttribute("cm_type");
                if (type && (type == "xsd:boolean" || type == "radiobutton")) {
                    formElem.checked = false;
                } else if (formElem.value) {
                    formElem.value = "";
                }
            }

            $(formularId + "_introtext").style.display = "block";
            $(formularId + "_answertext").innerHTML = "";
            $(formularId).style.display = "block";
        }
    });
}
