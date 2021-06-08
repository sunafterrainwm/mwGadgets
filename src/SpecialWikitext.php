<?php

/**
 * SpecialWikitext Key word
 */
$wgWikiTextKey = isset( $wgWikiTextKey ) ? $wgWikiTextKey : "_addText";

class SpecialWikitext {
	/**
	 * 用來trim的RegExp
	 */
	protected $wgTrimToken = "/^[\\s\\x00-\\x1F\\x80-\\xFF\\xA0\\t\\r\\n\\f ;}]+|[\\s\\x00-\\x1F\\x80-\\xFF\\xA0\\t\\r\\n\\f ;}]+$/u";
	
	/**
	 * 合併多個wikitext字串，並以換行分隔
	 */
	protected function addText ( string $input, string $new ) {
		if ( $new !== "" ) {
			if ( $input !== "" ) {
				$input .= "\n";
			}
			$new = stripslashes( $new );
			$input .= $new;
		}
		return $input;
	}

	/**
	 * 讀取wikitext字串，並忽略註解尾部
	 */
	protected function getString ( string $str ) {
		$temp = preg_grep( "/[^\n]*\*\//", [ $str ] );
		if ( $temp ) {
			$str = $temp[ 0 ];
			$str = substr( $str, 2, -2 );
		}

		$str = trim( $str );
		$first = substr( $str, 0, 1 );
		$last = substr( $str, strlen( $str ) - 1, 1 );

		if ( $first === $last && ( $first === "'" || $first === "\"" ) ) {
			$str = substr( $str, 1, -1 );
		}

		$str = trim( $str );

		return $str;
	}

	/**
	 * 讀取CSS之 ```_addText{content："XXX"}``` 模式的字串
	 */
	protected function getContentText ( string $str ) {
		global $wgWikiTextKey;
		$ret = "";
		$matches = preg_replace( "/$wgWikiTextKey\s*\{[^c\\}]*content\s*:\s*[^\n]*/" );
		if ( $matches ) {
			foreach ( $matches as $i => $temp ) {
				$s = preg_grep( "/content\s*:\s*[^\n]*/", [ $temp ] );
				$temp = $s && $s[ 0 ] || "content:";
				$temp = preg_replace( $this -> wgTrimToken, "", $temp );
				$temp = preg_replace( "/\s*content\s*:\s*/", "", $temp );
				if ( $ret !== "" ) {
					$ret .= "\n";
				}
				$ret .= $this -> getString( $temp );
			}
		}
		return $ret;
	}

	/**
	 * 讀取物件定義模式為 ```_addText＝XXX``` 或 ```_addText：XXX``` 模式的字串
	 */
	protected function getObjText ( string $wikitext ) {
		global $wgWikiTextKey;
		$ret = "";
		$matches = preg_grep( "/$wgWikiTextKey\s*[\=:]\s*[^\n]/", [ $wikitext ] );
		if ( $matches ) {
			foreach ( $matches as $i => $temp ) {
				$temp = preg_replace( $this -> wgTrimToken, "", $temp );
				$temp = preg_replace( "/^.*$wgWikiTextKey\s*[\=:]\s*/", "", $temp );
				$ret = $this -> addText( $ret, $this -> getString( $temp ) );
			}
		}
		return $ret;
	}

	/**
	 * 分析CSS中符合條件的wikitext
	 */
	public function getCSSwikitext ( string $cssText ) {
		$ret = "";
		$cssText = trim( $cssText );
		if ( $cssText === "" ) {
			return "";
		}
		// 匹配 _addText { content："XXX" } 模式
		$ret = $this -> addText( $ret, $this -> getContentText( $cssText ) );
		// 同時亦匹配 /* _addText：XXX */ 模式
		$ret = $this -> addText( $ret, $this -> getObjText( $cssText ) );
		return $ret;
	}

	/**
	 * 分析JavaScript中符合條件的wikitext
	 */
	public function getJSwikitext ( string $jsText ) {
		$jsText = trim( $jsText );
		if ( $jsText === "" ) {
			return "";
		}
		return $this -> addText( "", $this -> getObjText( $jsText ) );
	}

	/**
	 * 分析JSON中符合條件的wikitext
	 */
	public function getJSONwikitext ( $jsonText ) {
		global $wgWikiTextKey;
		$ret = "";
		$jsonText = trim( $jsonText );
		if ( $jsonText === "" ) {
			return "";
		}
		$json = json_decode( $jsonText, true );
		if ( json_last_error() !== 0 ) {
			return "";
		}
		foreach ( $json as $k => $v ) {
			if ( preg_match( "/$wgWikiTextKey/", $k ) && is_string( $v ) ) {
				$ret = $this -> addText( $ret, $v );
			} else if ( is_array( $v ) ) {
				foreach ( $v as $vk => $vv ) {
					if ( preg_match( "/$wgWikiTextKey/", $vk ) && is_string( $vv ) ) {
						$ret = $this -> addText( $ret, $vv );
					}
				}
			}
		}
		return $ret;
	}
}
