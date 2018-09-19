ace.define("ace/theme/pinguin",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-pinguin";
exports.cssText = ".ace-pinguin .ace_gutter {\
background: #f6f6f6;\
color: #4D4D4C\
}\
.ace-pinguin .ace_print-margin {\
width: 1px;\
background: #f6f6f6\
}\
.ace-pinguin {\
background-color: #FFFFFF;\
color: #333333\
}\
.ace-pinguin .ace_cursor {\
color: #333333\
}\
.ace-pinguin .ace_marker-layer .ace_selection {\
background: #dddddd\
}\
.ace-pinguin.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #FFFFFF;\
}\
.ace-pinguin .ace_marker-layer .ace_step {\
background: rgb(255, 255, 0)\
}\
.ace-pinguin .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #D1D1D1\
}\
.ace-pinguin .ace_marker-layer .ace_active-line {\
background: #f6f6f6\
}\
.ace-pinguin .ace_gutter-active-line {\
background-color : #dcdcdc\
}\
.ace-pinguin .ace_marker-layer .ace_selected-word {\
border: 1px solid #d7d7d7\
}\
.ace-pinguin .ace_invisible {\
color: #D1D1D1\
}\
.ace-pinguin .ace_keyword,\
.ace-pinguin .ace_meta,\
.ace-pinguin .ace_storage,\
.ace-pinguin .ace_storage.ace_type,\
.ace-pinguin .ace_support.ace_type {\
color: #8900cb\
}\
.ace-pinguin .ace_keyword.ace_operator {\
color: #555555\
}\
.ace-pinguin .ace_constant.ace_character,\
.ace-pinguin .ace_constant.ace_language,\
.ace-pinguin .ace_keyword.ace_other.ace_unit,\
.ace-pinguin .ace_support.ace_constant,\
.ace-pinguin .ace_variable.ace_parameter {\
color: #e68020\
}\
.ace-pinguin .ace_constant.ace_numeric,\
.ace-pinguin .ace_constant.ace_other {\
color: #042acb\
}\
.ace-pinguin .ace_invalid {\
color: #FFFFFF;\
background-color: #C82829\
}\
.ace-pinguin .ace_invalid.ace_deprecated {\
color: #FFFFFF;\
background-color: #ff05f5\
}\
.ace-pinguin .ace_fold {\
background-color: #4271AE;\
border-color: #4D4D4C\
}\
.ace-pinguin .ace_entity.ace_name.ace_function,\
.ace-pinguin .ace_support.ace_function,\
.ace-pinguin .ace_variable {\
color: #4271AE\
}\
.ace-pinguin .ace_support.ace_class,\
.ace-pinguin .ace_support.ace_type {\
color: #ebb907\
}\
.ace-pinguin .ace_heading,\
.ace-pinguin .ace_markup.ace_heading,\
.ace-pinguin .ace_string {\
color: #33a100\
}\
.ace-pinguin .ace_entity.ace_name.ace_tag,\
.ace-pinguin .ace_entity.ace_other.ace_attribute-name,\
.ace-pinguin .ace_meta.ace_tag,\
.ace-pinguin .ace_string.ace_regexp,\
.ace-pinguin .ace_variable {\
color: #555555\
}\
.ace-pinguin .ace_comment {\
color: #888888\
}\
.ace-pinguin .ace_indent-guide {\
  border-right: 1px dashed #cccccc;\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
