﻿using System;
using System.Collections.Generic;
using WickedSick.Server.XamlParser.Elements.Shapes;
using WickedSick.Server.XamlParser.Elements.Types;

namespace WickedSick.Server.XamlParser.TypeConverters
{
    public class PointCollectionConverter : ITypeConverter
    {
        public Type ConversionType
        {
            get { return typeof(PointCollection); }
        }

        public object Convert(string from)
        {
            var pc = new PointCollection();
            pc.AddContent(ParsePoints(from));
            return pc;
        }

        protected static IEnumerable<Point> ParsePoints(string from)
        {
            var converter = new PointConverter();
            var pointTokens = from.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < pointTokens.Length; i++)
            {
                yield return (Point)converter.Convert(pointTokens[i]);
            }
        }
    }
}