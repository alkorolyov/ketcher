var Vec2 = require('../../util/vec2');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var utils = require('./utils');

function ChainTool(editor) {
	if (!(this instanceof ChainTool))
		return new ChainTool(editor);

	this.editor = editor;
	this.editor.selection(null);
	this.hoverHelper = new HoverHelper(this);
}

ChainTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	this.hoverHelper.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: this.editor.findItem(event, ['atoms'])
	};
	if (!this.dragCtx.item) // ci.type == 'Canvas'
		delete this.dragCtx.item;
	return true;
};

ChainTool.prototype.OnMouseMove = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = editor.render;
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		if ('action' in dragCtx)
			dragCtx.action.perform(rnd.ctab);

		var atoms = rnd.ctab.molecule.atoms;
		var pos0 = dragCtx.item ? atoms.get(dragCtx.item.id).pp :
		                          dragCtx.xy0;
		var pos1 = rnd.page2obj(event);
		var sectCount = Math.ceil(Vec2.diff(pos1, pos0).length());
		var angle = event.ctrlKey ? utils.calcAngle(pos0, pos1) :
		                            utils.fracAngle(pos0, pos1);

		dragCtx.action = Action.fromChain(rnd.ctab, pos0, angle, sectCount,
		                                  dragCtx.item ? dragCtx.item.id : null);
		editor.event.message.dispatch({
			info: sectCount + " sectors"
		});
		rnd.update();
		return true;
	}
	this.hoverHelper.hover(this.editor.findItem(event, ['atoms']));
	return true;
};
ChainTool.prototype.OnMouseUp = function () {
	if (this.dragCtx) {
		var action = this.dragCtx.action;
		delete this.dragCtx;
		if (action)
			this.editor.update(action);
	}
	return true;
};
ChainTool.prototype.OnCancel = function () {
	this.OnMouseUp(); // eslint-disable-line new-cap
};

module.exports = ChainTool;
