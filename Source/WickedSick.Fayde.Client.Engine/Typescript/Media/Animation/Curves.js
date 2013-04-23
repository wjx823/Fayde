var Fayde;
(function (Fayde) {
    (function (Media) {
        (function (Animation) {
            var Curves = (function () {
                function Curves() { }
                Curves.QuadraticArrayYForX = function QuadraticArrayYForX(arr, x, count) {
                    for(var i = 0; i < count; i++) {
                        if(x < arr[i].c2.x) {
                            return Curves.QuadraticYForX(x, arr[i]);
                        }
                    }
                    return 0.0;
                };
                Curves.QuadraticYForX = function QuadraticYForX(x, src) {
                    var l = src.c2.x - src.c0.x;
                    if(l <= 0) {
                        return 0.0;
                    }
                    x = (x - src.c0.x) / l;
                    return ((1 - x) * (1 - x)) * src.c0.y + ((2 * x) * (1 - x) * src.c1.y) + ((x * x) * src.c2.y);
                };
                Curves.SubdivideCubicAtLevel = function SubdivideCubicAtLevel(b, lvl, src) {
                    Curves.RecursiveSubdivide(b, lvl, 1, 0, src);
                };
                Curves.RecursiveSubdivide = function RecursiveSubdivide(b, lvl, currentlvl, pos, src) {
                    var data = {
                        b1: null,
                        b2: null
                    };
                    Curves.SubdivideCubic(data, src);
                    var b1 = data.b1;
                    var b2 = data.b2;
                    if(currentlvl === lvl) {
                        b[pos] = b1;
                        b[pos + 1] = b2;
                        return pos + 2;
                    }
                    pos = Curves.RecursiveSubdivide(b, lvl, currentlvl + 1, pos, b1);
                    pos = Curves.RecursiveSubdivide(b, lvl, currentlvl + 1, pos, b2);
                    return pos;
                };
                Curves.SubdivideCubic = function SubdivideCubic(data, src) {
                    var p01 = {
                        x: 0,
                        y: 0
                    }, p012 = {
                        x: 0,
                        y: 0
                    }, p0123 = {
                        x: 0,
                        y: 0
                    };
                    var p12 = {
                        x: 0,
                        y: 0
                    }, p123 = {
                        x: 0,
                        y: 0
                    };
                    var p23 = {
                        x: 0,
                        y: 0
                    };
                    Curves.HalfLerpPoint(p01, src.c0, src.c1);
                    Curves.HalfLerpPoint(p12, src.c1, src.c2);
                    Curves.HalfLerpPoint(p23, src.c2, src.c3);
                    Curves.HalfLerpPoint(p012, p01, p12);
                    Curves.HalfLerpPoint(p123, p12, p23);
                    Curves.HalfLerpPoint(p0123, p012, p123);
                    data.b1 = {
                        c0: src.c0,
                        c1: p01,
                        c2: p012,
                        c3: p0123
                    };
                    data.b2 = {
                        c0: p0123,
                        c1: p123,
                        c2: p23,
                        c3: src.c3
                    };
                };
                Curves.HalfLerpPoint = function HalfLerpPoint(p, p1, p2) {
                    p.x = p1.x + (p2.x - p1.x) * 0.5;
                    p.y = p1.y + (p2.y - p1.y) * 0.5;
                };
                Curves.ConvertCubicsToQuadratics = function ConvertCubicsToQuadratics(srcArray, count) {
                    var destArray = [];
                    for(var i = 0; i < count; i++) {
                        destArray.push(Curves.QuadraticFromCubic(srcArray[i]));
                    }
                    return destArray;
                };
                Curves.QuadraticFromCubic = function QuadraticFromCubic(src) {
                    return {
                        c0: {
                            x: src.c0.x,
                            y: src.c0.y
                        },
                        c1: {
                            x: (src.c1.x + src.c2.x) / 2.0,
                            y: (src.c1.y + src.c2.y) / 2.0
                        },
                        c2: {
                            x: src.c3.x,
                            y: src.c3.y
                        }
                    };
                };
                return Curves;
            })();
            Animation.Curves = Curves;            
        })(Media.Animation || (Media.Animation = {}));
        var Animation = Media.Animation;
    })(Fayde.Media || (Fayde.Media = {}));
    var Media = Fayde.Media;
})(Fayde || (Fayde = {}));
//@ sourceMappingURL=Curves.js.map