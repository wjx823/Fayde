declare var vec2;
declare var vec4;
declare var mat3;
declare var mat4;

var RectOverlap = {
    Out: 0,
    In: 1,
    Part: 2
};

class rect {
    X: number = 0;
    Y: number = 0;
    Width: number = 0;
    Height: number = 0;
    toString(): string {
        return "{" + this.X + "," + this.Y + "," + this.Width + "," + this.Height + "}";
    }

    static _TypeName = "rect";

    static fromSize(size: size): rect {
        var r = new rect();
        r.Width = size.Width;
        r.Height = size.Height;
        return r;
    }

    static clear(dest: rect) {
        dest.X = 0;
        dest.Y = 0;
        dest.Width = 0;
        dest.Height = 0;
    }
    static set (dest: rect, x: number, y: number, width: number, height: number) {
        dest.X = x;
        dest.Y = y;
        dest.Width = width;
        dest.Height = height;
    }
    static isEmpty(rect1: rect) {
        return rect1.Width <= 0
            || rect1.Height <= 0;
    }
    static isEmptyLogical(rect1: rect) {
        return rect1.Width <= 0
            && rect1.Height <= 0;
    }
    static copyTo(src: rect, dest: rect) {
        dest.X = src.X;
        dest.Y = src.Y;
        dest.Width = src.Width;
        dest.Height = src.Height;
    }
    static clone(src: rect): rect {
        var r = new rect();
        r.X = src.X;
        r.Y = src.Y;
        r.Width = src.Width;
        r.Height = src.Height;
        return r;
    }
    static isEqual(rect1: rect, rect2: rect): bool {
        return rect1.X === rect2.X
            && rect1.Y === rect2.Y
            && rect1.Width === rect2.Width
            && rect1.Height === rect2.Height;
    }
    
    static intersection(rect1: rect, rect2: rect) {
        var x = Math.max(rect1.X, rect2.X);
        var y = Math.max(rect2.Y, rect2.Y);
        rect1.Width = Math.max(0, Math.min(rect1.X + rect1.Width, rect2.X + rect2.Width) - x);
        rect1.Height = Math.max(0, Math.min(rect1.Y + rect1.Height, rect2.Y + rect2.Height) - y);
        rect1.X = x;
        rect1.Y = y;
    }
    static union(rect1: rect, rect2: rect) {
        if (rect.isEmpty(rect2))
            return;
        if (rect.isEmpty(rect1)) {
            rect.copyTo(rect2, rect1);
            return;
        }

        var x = Math.min(rect1.X, rect2.X);
        var y = Math.min(rect1.Y, rect2.Y);
        rect1.Width = Math.max(rect1.X + rect1.Width, rect2.X + rect2.Width) - x;
        rect1.Height = Math.max(rect1.Y + rect1.Height, rect2.Y + rect2.Height) - y;
        rect1.X = x;
        rect1.Y = y;
    }
    static unionLogical(rect1: rect, rect2: rect) {
        if (rect.isEmptyLogical(rect2))
            return;
        if (rect.isEmptyLogical(rect1)) {
            rect.copyTo(rect2, rect1);
            return;
        }

        var x = Math.min(rect1.X, rect2.X);
        var y = Math.min(rect1.Y, rect2.Y);
        rect1.Width = Math.max(rect1.X + rect1.Width, rect2.X + rect2.Width) - x;
        rect1.Height = Math.max(rect1.Y + rect1.Height, rect2.Y + rect2.Height) - y;
        rect1.X = x;
        rect1.Y = y;
    }
    
    static growBy(dest: rect, left: number, top: number, right: number, bottom: number) {
        dest.X -= left;
        dest.Y -= top;
        dest.Width += left + right;
        dest.Height += top + bottom;
        if (dest.Width < 0)
            dest.Width = 0;
        if (dest.Height < 0)
            dest.Height = 0;
    }
    static growByThickness(dest: rect, thickness) {
        dest.X -= thickness.Left;
        dest.Y -= thickness.Top;
        dest.Width += thickness.Left + thickness.Right;
        dest.Height += thickness.Top + thickness.Bottom;
        if (dest.Width < 0)
            dest.Width = 0;
        if (dest.Height < 0)
            dest.Height = 0;
    }
    static shrinkBy(dest: rect, left: number, top: number, right: number, bottom: number) {
        dest.X += left;
        dest.Y += top;
        dest.Width -= left + right;
        dest.Height -= top + bottom;
        if (dest.Width < 0)
            dest.Width = 0;
        if (dest.Height < 0)
            dest.Height = 0;
    }
    static shrinkByThickness(dest: rect, thickness) {
        dest.X += thickness.Left;
        dest.Y += thickness.Top;
        dest.Width -= thickness.Left + thickness.Right;
        dest.Height -= thickness.Top + thickness.Bottom;
        if (dest.Width < 0)
            dest.Width = 0;
        if (dest.Height < 0)
            dest.Height = 0;
    }
    static extendTo(rect1: rect, x: number, y: number) {
        var rx = rect1.X;
        var ry = rect1.Y;
        var rw = rect1.Width;
        var rh = rect1.Height;

        if (x < rx || x > (rx + rw))
            rw = Math.max(Math.abs(x - rx), Math.abs(x - rx - rw));
        if (y < ry || y > (ry + rh))
            rh = Math.max(Math.abs(y - ry), Math.abs(y - ry - rh));

        rect1.X = Math.min(rx, x);
        rect1.Y = Math.min(ry, y);
        rect1.Width = rw;
        rect1.Height = rh;
    }
    
    static transform(dest: rect, xform) {
        if (!xform)
            return;
        var x = dest.X;
        var y = dest.Y;
        var width = dest.Width;
        var height = dest.Height;

        var p1 = vec2.createFrom(x, y);
        var p2 = vec2.createFrom(x + width, y);
        var p3 = vec2.createFrom(x + width, y + height);
        var p4 = vec2.createFrom(x, y + height);

        mat3.transformVec2(xform, p1);
        mat3.transformVec2(xform, p2);
        mat3.transformVec2(xform, p3);
        mat3.transformVec2(xform, p4);

        var l = Math.min(p1[0], p2[0], p3[0], p4[0]);
        var t = Math.min(p1[1], p2[1], p3[1], p4[1]);
        var r = Math.max(p1[0], p2[0], p3[0], p4[0]);
        var b = Math.max(p1[1], p2[1], p3[1], p4[1]);

        dest.X = l;
        dest.Y = t;
        dest.Width = r - l;
        dest.Height = b - t;
    }
    private static clipmask (clip) {
        var mask = 0;

        if (-clip[0] + clip[3] < 0) mask |= (1 << 0);
        if (clip[0] + clip[3] < 0) mask |= (1 << 1);
        if (-clip[1] + clip[3] < 0) mask |= (1 << 2);
        if (clip[1] + clip[3] < 0) mask |= (1 << 3);
        if (clip[2] + clip[3] < 0) mask |= (1 << 4);
        if (-clip[2] + clip[3] < 0) mask |= (1 << 5);

        return mask;
    };
    static transform4(dest: rect, projection) {
        if (!projection)
            return;

        var x = dest.X;
        var y = dest.Y;
        var width = dest.Width;
        var height = dest.Height;

        var p1 = vec4.createFrom(x, y, 0.0, 1.0);
        var p2 = vec4.createFrom(x + width, y, 0.0, 1.0);
        var p3 = vec4.createFrom(x + width, y + height, 0.0, 1.0);
        var p4 = vec4.createFrom(x, y + height, 0.0, 1.0);

        mat4.transformVec4(projection, p1);
        mat4.transformVec4(projection, p2);
        mat4.transformVec4(projection, p3);
        mat4.transformVec4(projection, p4);

        var vs = 65536.0;
        var vsr = 1.0 / vs;
        p1[0] *= vsr;
        p1[1] *= vsr;
        p2[0] *= vsr;
        p2[1] *= vsr;
        p3[0] *= vsr;
        p3[1] *= vsr;
        p4[0] *= vsr;
        p4[1] *= vsr;

        var cm1 = clipmask(p1);
        var cm2 = clipmask(p2);
        var cm3 = clipmask(p3);
        var cm4 = clipmask(p4);

        if ((cm1 | cm2 | cm3 | cm4) !== 0) {
            if ((cm1 & cm2 & cm3 & cm4) === 0) {
                rect.clear(dest);
                //TODO: Implement
                //var r1 = Matrix3D._ClipToBounds(p1, p2, p3, cm1 | cm2 | cm3);
                //var r2 = Matrix3D._ClipToBounds(p1, p3, p4, cm1 | cm3 | cm4);
                //if (!r1.IsEmpty()) rect.union(dest, r1);
                //if (!r2.IsEmpty()) rect.union(dest, r2);
            }
        } else {
            var p1w = 1.0 / p1[3];
            var p2w = 1.0 / p2[3];
            var p3w = 1.0 / p3[3];
            var p4w = 1.0 / p4[3];
            p1[0] *= p1w * vs;
            p1[1] *= p1w * vs;
            p2[0] *= p2w * vs;
            p2[1] *= p2w * vs;
            p3[0] *= p3w * vs;
            p3[1] *= p3w * vs;
            p4[0] *= p4w * vs;
            p4[1] *= p4w * vs;

            dest.X = p1[0];
            dest.Y = p1[1];
            dest.Width = 0;
            dest.Height = 0;
            rect.extendTo(dest, p2[0], p2[1]);
            rect.extendTo(dest, p3[0], p3[1]);
            rect.extendTo(dest, p4[0], p4[1]);
        }
    }

    static round(dest: rect) {
        dest.X = Math.round(dest.X);
        dest.Y = Math.round(dest.Y);
        dest.Width = Math.round(dest.Width);
        dest.Height = Math.round(dest.Height);
    }
    static roundOut(dest: rect) {
        var x = Math.floor(dest.X);
        var y = Math.floor(dest.Y);
        dest.Width = Math.ceil(dest.X + dest.Width) - Math.floor(dest.X);
        dest.Height = Math.ceil(dest.Y + dest.Height) - Math.floor(dest.Y);
        dest.X = x;
        dest.Y = y;
    }
    static roundIn(dest: rect) {
        var x = Math.ceil(dest.X);
        var y = Math.ceil(dest.Y);
        dest.Width = Math.floor(dest.X + dest.Width) - Math.ceil(dest.X);
        dest.Height = Math.floor(dest.Y + dest.Height) - Math.ceil(dest.Y);
        dest.X = x;
        dest.Y = y;
    }

    static copyGrowTransform(dest:rect, src: rect, thickness, xform) {
        rect.copyTo(src, dest);
        rect.growByThickness(dest, thickness);
        rect.transform(dest, xform);
    }
    static copyGrowTransform4(dest: rect, src: rect, thickness, projection) {
        rect.copyTo(src, dest);
        rect.growByThickness(dest, thickness);
        rect.transform4(dest, projection);
    }
    
    static containsPoint(rect1: rect, p): bool {
        return rect1.X <= p.X
            && rect1.Y <= p.Y
            && (rect1.X + rect1.Width) >= p.X
            && (rect1.Y + rect1.Height) >= p.Y;
    }
    static containsPointXY(rect1: rect, x: number, y: number): bool {
        return rect1.X <= x
            && rect1.Y <= y
            && (rect1.X + rect1.Width) >= x
            && (rect1.Y + rect1.Height) >= y;
    }
    static rectIn(rect1: rect, rect2: rect) {
        var copy = rect.clone(rect1);
        rect.intersection(copy, rect2);
        if (rect.isEmpty(copy))
            return RectOverlap.Out;
        if (rect.isEqual(copy, rect2))
            return RectOverlap.In;
        return RectOverlap.Part;
    }
    static isRectContainedIn(src: rect, test: rect) {
        var copy = rect.clone(src);
        rect.intersection(copy, test);
        return !rect.isEqual(src, copy);
    }
}

class size {
    Width: number = 0;
    Height: number = 0;
    toString(): string {
        return "{" + this.Width + "," + this.Height + "}";
    }
    
    static _TypeName = "size";

    static fromRaw(width: number, height: number): size {
        var s = new size();
        s.Width = width;
        s.Height = height;
        return s;
    }
    static fromRect(src: rect): size {
        var s = new size();
        s.Width = src.Width;
        s.Height = src.Height;
        return s;
    }
    static createInfinite(): size {
        var s = new size();
        s.Width = Number.POSITIVE_INFINITY;
        s.Height = Number.POSITIVE_INFINITY;
        return s;
    }
    static createNegativeInfinite(): size {
        var s = new size();
        s.Width = Number.NEGATIVE_INFINITY;
        s.Height = Number.NEGATIVE_INFINITY;
        return s;
    }
    static copyTo(src: size, dest: size) {
        dest.Width = src.Width;
        dest.Height = src.Height;
    }
    static clone(src: size): size {
        var s = new size();
        s.Width = src.Width;
        s.Height = src.Height;
        return s;
    }
    static clear(dest: size) {
        dest.Width = 0;
        dest.Height = 0;
    }
    static isEqual(size1: size, size2: size): bool {
        return size1.Width === size2.Width
            && size1.Height === size2.Height;
    }
    
    static growBy(dest: size, width: number, height: number) {
        var h = dest.Height;
        var w = dest.Width;
        if (h != Number.POSITIVE_INFINITY)
            h += height;
        if (w != Number.POSITIVE_INFINITY)
            w += width;
        dest.Width = w > 0 ? w : 0;
        dest.Height = h > 0 ? h : 0;
        return dest;
    }
    static growByThickness(dest: size, thickness) {
        var w = dest.Width;
        var h = dest.Height;
        if (w != Number.POSITIVE_INFINITY)
            w += thickness.Left + thickness.Right;
        if (h != Number.POSITIVE_INFINITY)
            h += thickness.Top + thickness.Bottom;
        dest.Width = w > 0 ? w : 0;
        dest.Height = h > 0 ? h : 0;
        return dest;
    }
    static shrinkBy(dest: size, width: number, height: number) {
        var h = dest.Height;
        var w = dest.Width;
        if (h != Number.POSITIVE_INFINITY)
            h -= height;
        if (w != Number.POSITIVE_INFINITY)
            w -= width;
        dest.Width = w > 0 ? w : 0;
        dest.Height = h > 0 ? h : 0;
        return dest;
    }
    static shrinkByThickness(dest: size, thickness) {
        var w = dest.Width;
        var h = dest.Height;
        if (w != Number.POSITIVE_INFINITY)
            w -= thickness.Left + thickness.Right;
        if (h != Number.POSITIVE_INFINITY)
            h -= thickness.Top + thickness.Bottom;
        dest.Width = w > 0 ? w : 0;
        dest.Height = h > 0 ? h : 0;
        return dest;
    }
    static min(dest: size, other: size) {
        dest.Width = Math.min(dest.Width, other.Width);
        dest.Height = Math.min(dest.Height, other.Height);
        return dest;
    }
    static max(dest: size, other: size) {
        dest.Width = Math.max(dest.Width, other.Width);
        dest.Height = Math.max(dest.Height, other.Height);
        return dest;
    }
}