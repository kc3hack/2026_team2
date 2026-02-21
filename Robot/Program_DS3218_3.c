#include <ESP32Servo.h>
Servo servo_ds3218_2;
const int pin_ds3218_2 = 6; // D5
// 設定：中央を90として、そこから±45度の範囲
const int center = 90;
const int leftLimit = 45;
const int rightLimit = 135;
void setup() {
  Serial.begin(115200);
  ESP32PWM::allocateTimer(0);
  
  servo_ds3218_2.attach(pin_ds3218_2, 500, 2500);
  Serial.println("スロースタート開始：中央(90度)へゆっくり移動");
  
  // 起動時の衝撃防止：0度（または現在の位置）から90度までじわじわ動かす
  for (int angle = 0; angle <= center; angle++) {
    servo_ds3218_2.write(angle);
    delay(20); 
  }
  delay(1000); // 中央で一息つく
}
void loop() {
  // 1. 中央(90)から右(135)へゆっくり移動
  Serial.println("Moving to Right (135)");
  for (int angle = center; angle <= rightLimit; angle++) {
    servo_ds3218_2.write(angle);
    delay(45); // スピード調整：数字を大きくするとさらに遅くなります
  }
  delay(500);
  // 2. 右(135)から左(45)へゆっくり移動
  Serial.println("Moving to Left (45)");
  for (int angle = rightLimit; angle >= leftLimit; angle--) {
    servo_ds3218_2.write(angle);
    delay(45);
  }
  delay(500);
  // 3. 左(45)から中央(90)へゆっくり戻る
  Serial.println("Returning to Center (90)");
  for (int angle = leftLimit; angle <= center; angle++) {
    servo_ds3218_2.write(angle);
    delay(45);
  }
  delay(1000); // 次のループまで1秒待機
}
