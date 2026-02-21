import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function CatBackground() {
  // Figmaの <path d="..."> の値をそのまま使用
  const earD = "M80.6271 9.12038C79.0188 -0.103902 67.3555 -3.22909 61.3505 3.95523L2.56731 74.2833C-2.58716 80.4501 0.396881 89.8828 8.1603 91.963L82.6872 111.932C90.4507 114.013 97.7513 107.336 96.3708 99.4178L80.6271 9.12038Z";

  return (
    <View style={styles.container}>
      {/* 1. 背景のベージュ */}
      <View style={styles.topBeige} />
      
      <View style={styles.earContainer}>
        {/* 左耳：Figmaの形状そのまま。反転させずに配置 */}
        <View style={[styles.earWrapper, styles.leftEar]}>
          <Svg width="97" height="113" viewBox="0 0 99 113">
            <Path d={earD} fill="#D5A959" />
          </Svg>
        </View>

        {/* 右耳：形状が同じなら scaleX で反転させるだけでOK */}
        <View style={[styles.earWrapper, styles.rightEar]}>
          <Svg width="97" height="113" viewBox="0 0 99 113">
            <Path d={earD} fill="#D5A959" />
          </Svg>
        </View>

        {/* 2. メインのオレンジボディ */}
        <View style={styles.mainBody} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: -1,
  },
  topBeige: {
    height: '19%',
  },
  earContainer: {
    flex: 1,
    position: 'relative',
  },
  earWrapper: {
    position: 'absolute',
    width: 97,
    height: 113,
    zIndex: 1,
  },
  leftEar: {
    top: -75, // ここは画面を見ながら「出し具合」を調整
    left: 10,
    transform: [{ rotate: '-30deg' }]
  },
  rightEar: {
    top: -75,
    right: 10,
    // 左右対称にするために反転
    transform: [{ scaleX: -1 },{ rotate: '-30deg' }],
  },
  mainBody: {
    flex: 1,
    backgroundColor: '#D5A959',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    zIndex: 1, // 耳の付け根を隠す
  },
});