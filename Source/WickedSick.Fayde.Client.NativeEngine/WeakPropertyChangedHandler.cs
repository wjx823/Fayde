using System;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class WeakPropertyChangedHandler
    {
        public WeakPropertyChangedHandler(IPropertyChangedListener handler, DependencyPropertyWrapper property)
        {
            WeakListener = new WeakReference(handler);
            Property = property;
        }

        public WeakReference WeakListener { get; protected set; }
        public DependencyPropertyWrapper Property { get; protected set; }

        public bool Handle(object sender, PropertyChangedEventArgsNative args)
        {
            var target = WeakListener.Target as IPropertyChangedListener;
            if (target == null)
                return false;
            if (args.Property._ID != Property._ID)
                return true;
            target.PropertyChanged(sender, args);
            return true;
        }
    }
}