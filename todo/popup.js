// отобразить elem
// @param {
	// target (HTML node) - узел окна
	// triger (HTML node) - узел тригера
	// hover (boolean) - реагирует на "mouseover" или "click"
	// toggleClass (string) - класс, который будет тоглится
	// show (function) - вызывающаяся при открытии
	// hide (function) - вызывающаяся при закрытии
// }
// @return (function) - удаляет Tooltip

function Tooltip(p = {}) {
	let doc = document,
		target = p.target,
		triger = p.triger,
		event = p.hover ? "mouseover" : 'click',
		toggleClass = p.toggleClass || 'hidden',
		fShow = typeof p.show == 'function' ? p.show : undefined,
		fHide = typeof p.hide == 'function' ? p.hide : undefined,
		flag,
		stop,
		ctx, 
		arg;

	if (!target || typeof target !== "object" || target.nodeType != 1) {
		throw "Parameter target is required";
	}
	if (!triger || typeof triger !== "object" || triger.nodeType != 1) {
		throw "Parameter triger is required";
	}

	const isVisible = t => !!t && !!( t.offsetWidth || t.offsetHeight || t.getClientRects().length )
	const removeDocListener = () => doc.removeEventListener(event, docListener);
	const upToggleClass = (is) => is ? target.classList.add(toggleClass) : target.classList.remove(toggleClass);
	const upTrigerDataset = (v) => triger.dataset.popup = v;
	const docListener = e => {
		stop // пропускаем перый клик, чтобы не закрыть попап
			&& !target.contains(e.target) // клик не по target и не по его дочерним элементам
				&& isVisible(target) // target видим
					&& hide()

		stop = 1;
	}
	const trigerListener = function(e) {
		ctx = this;
		arg = arguments;
		flag = triger.dataset.popup;
		stop = 0;

		typeof flag == 'undefined' ? flag = 1 : flag = +flag;
		e.relatedTarget != target && (flag ? show() : hide());
	}
	const hide = () => {
		upToggleClass(true);
		upTrigerDataset(1)
		removeDocListener();
		fShow && fHide.apply(ctx, arg);
	}
	const show = () => {
		upToggleClass(false);
		upTrigerDataset(0)
		fShow && fShow.apply(ctx, arg);
		doc.addEventListener(event, docListener);
	}

	triger.addEventListener(event, trigerListener)

	return () => {
		upToggleClass(true);
		upTrigerDataset(undefined)
		removeDocListener();
		triger.removeEventListener(event, trigerListener);
	};
}
