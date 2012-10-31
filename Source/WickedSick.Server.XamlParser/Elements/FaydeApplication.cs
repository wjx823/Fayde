﻿using System;
using WickedSick.Server.XamlParser.Elements.Types;

namespace WickedSick.Server.XamlParser.Elements
{
    public class FaydeApplication : DependencyObject
    {
        //public static readonly PropertyDescription DefaultPageUriProperty = PropertyDescription.Register("DefaultPageUri", typeof(string), typeof(FaydeApplication));
        public static readonly PropertyDescription WidthProperty = PropertyDescription.Register("Width", typeof(PageLength), typeof(FaydeApplication));
        public static readonly PropertyDescription HeightProperty = PropertyDescription.Register("Height", typeof(PageLength), typeof(FaydeApplication));

        public static readonly PropertyDescription DebugProperty = PropertyDescription.Register("Debug", typeof(bool), typeof(FaydeApplication));
        public bool Debug
        {
            get { object o = GetValue("Debug"); return o is bool && (bool)o; }
            set { SetValue("Debug", value); }
        }

        public static readonly PropertyDescription ResourcesProperty = PropertyDescription.Register("Resources", typeof(ResourceDictionary), typeof(FaydeApplication));
        public ResourceDictionary Resources
        {
            get { return GetValue("Resources") as ResourceDictionary; }
            set { SetValue("Resources", value); }
        }
        
        public static readonly PropertyDescription UriMappingsProperty = PropertyDescription.Register("UriMappings", typeof(UriMappingCollection), typeof(FaydeApplication));
        public UriMappingCollection UriMappings
        {
            get { return GetValue("UriMappings") as UriMappingCollection; }
            set { SetValue("UriMappings", value); }
        }

        public static readonly PropertyDescription ContentProperty = PropertyDescription.Register("Content", typeof(UIElement), typeof(FaydeApplication), true);
        public UIElement Content
        {
            get { return GetValue("Content") as UIElement; }
            set { SetValue("Content", value); }
        }

        public static readonly PropertyDescription ScriptResolutionProperty = PropertyDescription.Register("ScriptResolution", typeof(string), typeof(FaydeApplication));
        public string ScriptResolution
        {
            get { return GetValue("ScriptResolution") as string; }
            set { SetValue("ScriptResolution", value); }
        }


        public string MapUri(string fragment)
        {
            if (UriMappings == null)
                return null;

            var relativeUri = new Uri(fragment ?? string.Empty, UriKind.Relative);
            string mappedUri;
            foreach (var mapping in UriMappings)
            {
                if (mapping.TryMatch(relativeUri, out mappedUri))
                    return mappedUri;
            }
            return null;
        }
    }
}