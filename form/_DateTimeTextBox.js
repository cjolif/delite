dojo.provide("dijit.form._DateTimeTextBox");

dojo.require("dojo.date");
dojo.require("dojo.date.locale");
dojo.require("dojo.date.stamp");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit._HasDropDown");

new Date("X"); // workaround for #11279, new Date("") == NaN

/*=====
dojo.declare(
	"dijit.form._DateTimeTextBox.__Constraints",
	[dijit.form.RangeBoundTextBox.__Constraints, dojo.date.locale.__FormatOptions], {
	// summary:
	//		Specifies both the rules on valid/invalid values (first/last date/time allowed),
	//		and also formatting options for how the date/time is displayed.
	// example:
	//		To restrict to dates within 2004, displayed in a long format like "December 25, 2005":
	//	|		{min:'2004-01-01',max:'2004-12-31', formatLength:'long'}
});
=====*/

dojo.declare(
	"dijit.form._DateTimeTextBox",
	[ dijit.form.RangeBoundTextBox, dijit._HasDropDown ],
	{
		// summary:
		//		Base class for validating, serializable, range-bound date or time text box.

		templateString: dojo.cache("dijit.form", "templates/DropDownBox.html"),

		// hasDownArrow: [const] Boolean
		//		Set this textbox to display a down arrow button, to open the drop down list.
		hasDownArrow: true,

		// openOnClick: Boolean
		//		Set to true to open drop down upon clicking anywhere on the textbox.
		openOnClick: true,

		// constraints: dijit.form._DateTimeTextBox.__Constraints
		//		Despite the name, this parameter specifies both constraints on the input
		//		(including starting/ending dates/times allowed) as well as
		//		formatting options like whether the date is displayed in long (ex: December 25, 2005)
		//		or short (ex: 12/25/2005) format.   See `dijit.form._DateTimeTextBox.__Constraints` for details.
		/*=====
		constraints: {},
		======*/

		// Override ValidationTextBox.regExpGen().... we use a reg-ex generating function rather
		// than a straight regexp to deal with locale  (plus formatting options too?)
		regExpGen: dojo.date.locale.regexp,

		// datePackage: String
		//	JavaScript namespace to find calendar routines.  Uses Gregorian calendar routines
		//	at dojo.date, by default.
		datePackage: "dojo.date",

		// Override _FormWidget.compare() to work for dates/times
		compare: dojo.date.compare,

		// flag to _HasDropDown to make drop down Calendar width == <input> width
		forceWidth: true,

		format: function(/*Date*/ value, /*dojo.date.locale.__FormatOptions*/ constraints){
			// summary:
			//		Formats the value as a Date, according to specified locale (second argument)
			// tags:
			//		protected
			if(!value){ return ''; }
			return this.dateLocaleModule.format(value, constraints);
		},

		"parse": function(/*String*/ value, /*dojo.date.locale.__FormatOptions*/ constraints){
			// summary:
			//		Parses as string as a Date, according to constraints
			// tags:
			//		protected

			return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? null : undefined);	 // Date
		},

		// Overrides ValidationTextBox.serialize() to serialize a date in canonical ISO format.
		serialize: function(/*anything*/val, /*Object?*/options){
			if(val.toGregorian){
				val = val.toGregorian();
			}
			return dojo.date.stamp.toISOString(val, options);
		},

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Use get("value") / set("value", val) to manipulate.
		//		When passed to the parser in markup, must be specified according to `dojo.date.stamp.fromISOString`
		value: new Date(""),	// value.toString()="NaN"
		_blankValue: null,	// used by filter() when the textbox is blank

		//	popupClass: [protected extension] String
		//		Name of the popup widget class used to select a date/time.
		//		Subclasses should specify this.
		popupClass: "", // default is no popup = text only


		// _selector: [protected extension] String
		//		Specifies constraints.selector passed to dojo.date functions, should be either
		//		"date" or "time".
		//		Subclass must specify this.
		_selector: "",

		constructor: function(/*Object*/args){
			var dateClass = args.datePackage ? args.datePackage + ".Date" : "Date";
			this.dateClassObj = dojo.getObject(dateClass, false);
			this.value = new this.dateClassObj("");

			this.datePackage = args.datePackage || this.datePackage;
			this.dateLocaleModule = dojo.getObject(this.datePackage + ".locale", false);
			this.regExpGen = this.dateLocaleModule.regexp;
		},

		buildRendering: function(){
			this.inherited(arguments);
			
			// If openOnClick is true, we basically just want to treat the whole widget as the
			// button.   We need to do that also if the actual drop down button will be hidden,
			// so that there's a mouse method for opening the drop down.
			if(this.openOnClick || !this.hasDownArrow){
				this._buttonNode = this.domNode;
			}

			if(!this.hasDownArrow){
				this._buttonNode.style.display = "none";
			}
		},

		_setConstraintsAttr: function(/* Object */ constraints){
			constraints.selector = this._selector;
			constraints.fullYear = true; // see #5465 - always format with 4-digit years
			var fromISO = dojo.date.stamp.fromISOString;
			if(typeof constraints.min == "string"){ constraints.min = fromISO(constraints.min); }
 			if(typeof constraints.max == "string"){ constraints.max = fromISO(constraints.max); }
			this.inherited(arguments, [constraints]);
		},

		_setValueAttr: function(/*Date*/ value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			// summary:
			//		Sets the date on this textbox.  Note that `value` must be like a Javascript Date object.
			if(value !== undefined){
				if(!value || value.toString() == dijit.form._DateTimeTextBox.prototype.value.toString()){
					value = null;
				}
				if(value instanceof Date && !(this.dateClassObj instanceof Date)){
					value = new this.dateClassObj(value);
				}
			}
			this.inherited(arguments, [value, priorityChange, formattedValue]);
			if(this.dropDown){
				// #3948: fix blank date on popup only
				if(!value){value = new this.dateClassObj();}
				this.dropDown.set('value', value);
			}
		},

		openDropDown: function(/*Function*/ callback){
			// rebuild drop down every time, so that constraints get copied (#6002)
			if(this.dropDown){
				this.dropDown.destroy();
			}
			var PopupProto = dojo.getObject(this.popupClass, false),
				textBox = this;
			this.dropDown = new PopupProto({
				onValueSelected: function(value){
					if(textBox._tabbingAway){
						delete textBox._tabbingAway;
					}else{
						textBox.focus(); // focus the textbox before the popup closes to avoid reopening the popup
					}
					setTimeout(dojo.hitch(textBox, "closeDropDown"), 1); // allow focus time to take

					// this will cause InlineEditBox and other handlers to do stuff so make sure it's last
					dijit.form._DateTimeTextBox.superclass._setValueAttr.call(textBox, value, true);
				},
				id: this.id + "_popup",
				dir: textBox.dir,
				lang: textBox.lang,
				value: this.get('value') || new this.dateClassObj(),
				constraints: textBox.constraints,
				filterString: textBox.filterString,	// for TimeTextBox, to filter times shown

				datePackage: textBox.datePackage,

				isDisabledDate: function(/*Date*/ date){
					// summary:
					//		disables dates outside of the min/max of the _DateTimeTextBox
					var compare = dojo.date.compare;
					var constraints = textBox.constraints;
					return constraints && (
						(constraints.min && compare(constraints.min, date, textBox._selector) > 0) ||
						(constraints.max && compare(constraints.max, date, textBox._selector) < 0)
					);
				}
			});

			this.inherited(arguments);
		},

		_getDisplayedValueAttr: function(){
			return this.textbox.value;
		},

		_setDisplayedValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange){
			this._setValueAttr(this.parse(value, this.constraints), priorityChange, value);
		}
	}
);