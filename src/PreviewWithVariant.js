/* eslint-disable mediawiki/msg-doc */
/* from https://zh.wikipedia.org/wiki/User:Tranve/public/PreviewWithVariant.js?oldid=65985843 */
// <nowiki>

$.when(
	mw.loader.using( [ "ext.gadget.site-lib", "oojs", "oojs-ui", "oojs-ui-core", "user.options", "mediawiki.jqueryMsg" ] ),
	$.ready
).done( function () {
	if (
		[ "edit", "submit" ].indexOf( mw.config.get( "wgAction" ) ) === -1 ||
		mw.config.get( "wgPageContentModel" ) !== "wikitext"
	) {
		return;
	}

	window.wgUVS = ( function () {
		var lang = mw.config.get( "wgUserVariant" );
		return function () {
			var args = jQuery.makeArray( arguments );
			args.unshift( lang );
			return window.wgUXS.apply( this, args );
		};
	}() );

	var prefix = "pwv-",
		messages = {
			previewwith: wgULS( "预览变体", "預覽變體" ),
			dropdown: wgULS( "使用该变体显示预览：", "使用該變體顯示預覽：" ),
			"live-preview-tips": wgULS(
				"很抱歉，变体预览小工具与即时预览功能不兼容，请在您的[[Special:Preferences#mw-prefsection-editing|参数设置]]中关闭此功能后再试。",
				"很抱歉，變體預覽小工具與即時預覽功能不兼容，請在您的[[Special:Preferences#mw-prefsection-editing|偏好設定]]中關閉此功能後再試。"
			),
			"live-preview-header": wgULS( "变体预览小工具", "變體預覽小工具" ),
			"var-zh": wgULS( "不转换", "不轉換" ),
			"var-zh-hans": "简体",
			"var-zh-hant": "繁體",
			"var-zh-cn": "大陆简体",
			"var-zh-hk": "香港繁體",
			"var-zh-mo": "澳門繁體",
			"var-zh-my": "大马简体",
			"var-zh-sg": "新加坡简体",
			"var-zh-tw": "臺灣正體"
		};

	$.each( messages, function ( k, v ) {
		mw.messages.set( prefix + k, v );
	} );

	var VariantTable = [
		{ var: "zh", msg: "var-zh" },
		{ var: "zh-hans", msg: "var-zh-hans" },
		{ var: "zh-hant", msg: "var-zh-hant" },
		{ var: "zh-cn", msg: "var-zh-cn" },
		{ var: "zh-hk", msg: "var-zh-hk" },
		{ var: "zh-mo", msg: "var-zh-mo" },
		{ var: "zh-my", msg: "var-zh-my" },
		{ var: "zh-sg", msg: "var-zh-sg" },
		{ var: "zh-tw", msg: "var-zh-tw" }
	];

	function createMenus() {
		var ret = [];

		$.each( VariantTable, function ( _i, item ) {
			ret.push( new OO.ui.MenuOptionWidget( {
				data: item.var,
				label: mw.msg( prefix + item.msg )
			} ) );
		} );

		return ret;
	}

	/**
	 * @param {JQuery<HTMLFormElement>} $form
	 * @param {string} variant
	 */
	function applyVariant( $form, variant ) {
		if ( typeof URL === "function" ) {
			var url = new URL( $form.attr( "action" ), window.location.origin );
			url.searchParams.set( "variant", variant );
			$form.attr( "action", url.href );
		} else {
			$form.attr(
				"action",
				new mw.Uri( $form.attr( "action" ) )
					.extend( { variant: variant } )
					.getRelativePath()
			);
		}
	}

	function getCheckboxState() {
		return typeof URL === "function" ?
			new URL( window.location.href ).searchParams.get( "variant" ) :
			Object.hasOwnProperty.call( new mw.Uri().query, "variant" );
	}

	function initUI() {
		var $layout, $editForm, checkbox, checkboxField, dropdown, dropdownField;

		$layout = $( ".editCheckboxes .oo-ui-horizontalLayout" );

		if ( !$layout.length ) {
			return;
		}

		if ( mw.user.options.get( "uselivepreview" ) ) {
			mw.notify(
				mw.message( prefix + "live-preview-tips" ),
				{ title: mw.msg( prefix + "live-preview-header" ), type: "error", autoHide: false }
			);
			return;
		}

		$editForm = $( "#editform" );
		checkbox = new OO.ui.CheckboxInputWidget( {
			selected: getCheckboxState()
		} );
		checkboxField = new OO.ui.FieldLayout( checkbox, {
			align: "inline",
			label: mw.msg( prefix + "previewwith" )
		} );
		dropdown = new OO.ui.DropdownWidget( {
			$overlay: true,
			disabled: !checkbox.isSelected(),
			menu: {
				items: createMenus()
			}
		} );
		dropdownField = new OO.ui.FieldLayout( dropdown, {
			align: "top",
			label: mw.msg( prefix + "dropdown" ),
			invisibleLabel: true
		} );

		dropdown.getMenu().selectItemByData( mw.config.get( "wgUserVariant" ) );

		checkbox.on( "change", function ( selected ) {
			dropdown.setDisabled( !selected );
		} );
		$editForm.on(
			"click",
			"#wpPreview, input[name=wpTemplateSandboxPage]",
			function () {
				if ( checkbox.isSelected() ) {
					applyVariant( $editForm, dropdown.getMenu().findSelectedItem().getData() );
				}
			}
		);

		$layout.append( checkboxField.$element, dropdownField.$element );
	}

	initUI();
} );

// </nowiki>
