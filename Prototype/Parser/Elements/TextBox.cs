﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Parser.Elements
{
    [Element]
    public class TextBox: FrameworkElement
    {
        [Property]
        [Content]
        public string Text { get; set; }
    }
}
