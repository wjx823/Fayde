﻿/// <reference path="../Runtime/Nullstone.js"/>
/// CODE
/// <reference path="../Media/MediaParser.js"/>

//#region Fayde

var Fayde = {
    IsSilverlightInstalled: function (b) {
        if (b == undefined) b = null;
        var a = false,
            m = null;
        try {
            var i = null,
                j = false;
            if (window.ActiveXObject) try {
                i = new ActiveXObject("AgControl.AgControl");
                if (b === null) a = true;
                else if (i.IsVersionSupported(b)) a = true;
                i = null
            } catch (l) {
                j = true
            } else j = true;
            if (j) {
                var k = navigator.plugins["Silverlight Plug-In"];
                if (k) if (b === null) a = true;
                else {
                    var h = k.description;
                    if (h === "1.0.30226.2") h = "2.0.30226.2";
                    var c = h.split(".");
                    while (c.length > 3) c.pop();
                    while (c.length < 4) c.push(0);
                    var e = b.split(".");
                    while (e.length > 4) e.pop();
                    var d, g, f = 0;
                    do {
                        d = parseInt(e[f]);
                        g = parseInt(c[f]);
                        f++
                    } while (f < e.length && d === g);
                    if (d <= g && !isNaN(d)) a = true
                }
            }
        } catch (l) {
            a = false
        }
        return a
    },
    Start: function (rjson, json, canvas) {
        App.Instance = new App();
        App.Instance.LoadResources(rjson);
        App.Instance.LoadInitial(canvas, json);
    },
    TypeConverters: {
        Thickness: function (str) {
            /// <param name="str" type="String"></param>
            if (!str)
                return new Thickness();
            var tokens = str.split(",");
            var left, top, right, bottom;
            if (tokens.length === 1) {
                left = top = right = bottom = parseFloat(tokens[0]);
            } else if (tokens.length === 2) {
                left = right = parseFloat(tokens[0]);
                top = bottom = parseFloat(tokens[1]);
            } else if (tokens.length === 4) {
                left = parseFloat(tokens[0]);
                top = parseFloat(tokens[1]);
                right = parseFloat(tokens[2]);
                bottom = parseFloat(tokens[3]);
            } else {
                throw new ParseException("Cannot parse Thickness value '" + str + "'");
            }
            return new Thickness(left, top, right, bottom);
        },
        CornerRadius: function (str) {
            /// <param name="str" type="String"></param>
            if (!str)
                return new Thickness();
            var tokens = str.split(",");
            var topLeft, topRight, bottomRight, bottomLeft;
            if (tokens.length === 1) {
                topLeft = topRight = bottomRight = bottomLeft = parseFloat(tokens[0]);
            } else if (tokens.length === 4) {
                topLeft = parseFloat(tokens[0]);
                topRight = parseFloat(tokens[1]);
                bottomLeft = parseFloat(tokens[2]);
                bottomRight = parseFloat(tokens[3]);
            } else {
                throw new ParseException("Cannot parse CornerRadius value '" + str + "'");
            }
        },
        Brush: function (str) {
            return new SolidColorBrush(Fayde.TypeConverters.Color(str));
        },
        Color: function (str) {
            if (!str)
                return new Color(0, 0, 0, 1.0);
            if (str.substr(0, 1) !== "#") {
                var color = Color.KnownColors[str];
                if (!color)
                    throw new NotSupportedException("Unknown Color: " + str);
                return color;
            }
            return Color.FromHex(str);
        }
    },
    TypeConverter: {
        ConvertObject: function (propd, val, objectType, doStringConversion) {
            /// <param name="propd" type="DependencyProperty"></param>
            /// <param name="val" type="Object"></param>
            /// <param name="objectType" type="Function"></param>
            /// <param name="doStringConversion" type="Boolean"></param>

            if (val == null)
                return val;

            var targetType = propd.GetTargetType();
            if (typeof targetType === "function" && targetType._IsNullstone) {
                if (val instanceof targetType)
                    return val;
                var converter = Fayde.TypeConverters[targetType._TypeName];
                if (converter)
                    return converter(val);
            } else if (targetType instanceof Enum) {
                if (typeof val === "string") {
                    var ret = targetType.Object[val];
                    if (ret !== undefined)
                        return ret;
                    return val;
                }
            } else if (typeof targetType === "number" || targetType === Number) {
                if (typeof val === "number")
                    return val;
                if (!val)
                    return 0;
                if (val instanceof Thickness)
                    return val.Left;
                return parseFloat(val.toString());
            }

            if (typeof targetType === "string" || targetType === String)
                return doStringConversion ? val.toString() : "";

            var tc;
            if (propd._IsAttached) {
                //TODO: Find type converter for attached property
            } else {
                //TODO: Find type converter
            }
            return val;

            //TODO: Default to basic type converter, return
            //if (tc == null)
            //tc = new TypeConverter();
            //return tc.ConvertFrom(val);
        },
        GeometryFromString: function (val) {
            return Fayde._MediaParser.ParseGeometry(val);
        },
        PointCollectionFromString: function (val) {
            return Fayde._MediaParser.ParsePointCollection(val);
        }
    },
    Clone: function (value) {
        if (value instanceof DependencyObject)
            return value.Clone();

        if (typeof value === "number")
            return value;

        var typeName = value.constructor._TypeName;
        switch (typeName) {
            case "FontFamily":
                return new FontFamily(value.FamilyNames);
            case "_PropertyPath":
                return new _PropertyPath(value._Path, value._ExpandedPath);
            case "Color":
                return new Color(value.R, value.G, value.B, value.A);
            case "Point":
                return new Point(value.X, value.Y);
            case "Rect":
                return new Rect(value.X, value.Y, value.Width, value.Height);
            case "Size":
                return new Size(value.Width, value.Height);
            case "Uri":
                return new Uri(value._OriginalString);
            case "RepeatBehavior":
                var rb = new RepeatBehavior();
                rb._Duration = value._Duration;
                rb._Count = value._Count;
                rb.IsForever = value.IsForever;
                return rb;
            case "Duration":
                var dur = new Duration();
                dur._Type = value._Type;
                dur._TimeSpan = value._TimeSpan;
                return dur;
            case "KeyTime":
                var kt = new KeyTime();
                kt._TimeSpan = value._TimeSpan;
                kt._IsPaced = value._IsPaced;
                kt._IsUniform = value._IsUniform;
                kt._Percent = value._Percent;
                return kt;
            case "GridLength":
                return new GridLength(value.Value, value.Type);
            case "Thickness":
                return new Thickness(value.Left, value.Top, value.Right, value.Bottom);
            case "CornerRadius":
                return new CornerRadius(value.TopLeft, value.TopRight, value.BottomRight, value.BottomLeft);
        }

        return new value.constructor();
    }
};

//#endregion