#include <ESP32Servo.h>
Servo servo_sg92r;
const int pin_sg92r = 2; // D1 (GPIO 2)
// 設定：中央を90として、そこから±45度の範囲
const int center = 90;
const int leftLimit = 45;
const int rightLimit = 135;
void setup() {
  Serial.begin(115200);
  
  // ESP32PWMのタイマー割り当て
  ESP32PWM::allocateTimer(0);
  
  // SG92Rの特性に合わせたパルス幅設定 (500-2400)
  servo_sg92r.attach(pin_sg92r, 500, 2400);
  Serial.println("SG92R(D1)：スロースタート開始...");
  
  // 起動時の「ガツン」防止
  for (int angle = 0; angle <= center; angle++) {
    servo_sg92r.write(angle);
    delay(20); 
  }
  delay(1000); 
}
void loop() {
  // 1. 中央(90)から右(135)へゆっくり移動
  Serial.println("SG92R: 右(135)へ移動中");
  for (int angle = center; angle <= rightLimit; angle++) {
    servo_sg92r.write(angle);
    delay(45); // スピード3分の1
  }
  delay(500);
  // 2. 右(135)から左(45)へゆっくり移動
  Serial.println("SG92R: 左(45)へ移動中");
  for (int angle = rightLimit; angle >= leftLimit; angle--) {
    servo_sg92r.write(angle);
    delay(45);
  }
  delay(500);
  // 3. 左(45)から中央(90)へゆっくり戻る
  Serial.println("SG92R: 中央(90)へ戻ります");
  for (int angle = leftLimit; angle <= center; angle++) {
    servo_sg92r.write(angle);
    delay(45);
  }
  delay(1000); 
}
