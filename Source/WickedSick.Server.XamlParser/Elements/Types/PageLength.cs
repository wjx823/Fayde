﻿
namespace WickedSick.Server.XamlParser.Elements.Types
{
    public enum PageLengthType
    {
        Pixel,
        Percentage
    }

    public class PageLength : IJsonConvertible
    {
        public double Value { get; set; }
        public PageLengthType LengthType { get; set; }

        public string ToJson(int tabIndents, IJsonOutputModifiers outputMods)
        {
            if (LengthType == PageLengthType.Pixel)
                return Value.ToString();
            else
                return string.Format("{0}%", Value);
        }
    }
}
