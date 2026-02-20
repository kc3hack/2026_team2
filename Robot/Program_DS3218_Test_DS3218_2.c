#include <ESP32Servo.h>
Servo servo_ds3218_1;
const int pin_ds3218_1 = 5; // D4 (GPIO 5)
// 設定：中央を90として、そこから±45度の範囲
const int center = 90;
const int leftLimit = 45;
const int rightLimit = 135;
void setup() {
  Serial.begin(115200);
  ESP32PWM::allocateTimer(0);
  
  // DS3218の可動域を活かすため500-2500μsに設定
  servo_ds3218_1.attach(pin_ds3218_1, 500, 2500);
  Serial.println("D4ピン：スロースタート開始...");
  
  // 起動時の「ガツン」防止：0度から90度までじわじわ移動
  for (int angle = 0; angle <= center; angle++) {
    servo_ds3218_1.write(angle);
    delay(20); 
  }
  delay(1000); 
}
void loop() {
  // 1. 中央(90)から右(135)へゆっくり移動
  Serial.println("D4: 右(135)へ移動中");
  for (int angle = center; angle <= rightLimit; angle++) {
    servo_ds3218_1.write(angle);
    delay(45); // スピード3分の1（数値が大きいほど遅い）
  }
  delay(500);
  // 2. 右(135)から左(45)へゆっくり移動
  Serial.println("D4: 左(45)へ移動中");
  for (int angle = rightLimit; angle >= leftLimit; angle--) {
    servo_ds3218_1.write(angle);
    delay(45);
  }
  delay(500);
  // 3. 左(45)から中央(90)へゆっくり戻る
  Serial.println("D4: 中央(90)へ戻ります");
  for (int angle = leftLimit; angle <= center; angle++) {
    servo_ds3218_1.write(angle);
    delay(45);
  }
  delay(1000); 
}
