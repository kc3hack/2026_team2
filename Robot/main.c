#include <Arduino.h>
#include <ESP32Servo.h>

// --- ピン配置設定 ---
const int LED_CONNECT = 2;   // GPIO2
const int LED_ACTION  = 4;   // GPIO4
const int pin_sg92r   = 13;  // GPIO13
const int pin_d4_serv = 12;  // GPIO12
const int pin_d5_serv = 14;  // GPIO14

Servo s_fast, s_d4, s_d5;

// --- 動作設定 ---
const int center = 90;
bool isMoving = false;
unsigned long last_update = 0;
const int update_interval = 20;

struct ServoState {
  float currentPos;
  float low;
  float high;
  float step;
  int dir;
};

// --- サーボ個別設定 ---
ServoState st_f  = {90.0, 45.0, 135.0, 4.0, 1};     // SG92R: 爆速
ServoState st_d4 = {60.0, 60.0, 90.0, 0.25, 1};     // D4: 60-90

// ★ D5：範囲 60–120、初期150、スピード3倍(0.90)
ServoState st_d5 = {150.0, 60.0, 120.0, 0.90, -1};

void setup() {
  Serial.begin(9600);
  pinMode(LED_CONNECT, OUTPUT);
  pinMode(LED_ACTION, OUTPUT);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);

  s_fast.attach(pin_sg92r, 500, 2400);
  s_d4.attach(pin_d4_serv, 500, 2500);
  s_d5.attach(pin_d5_serv, 500, 2500);

  // --- 初期ポーズ ---
  s_fast.write(center);
  s_d4.write(60);

  // --- D5 を 150 度へゆっくり移動 ---
  Serial.println("D5 Initial moving to 150...");
  for (int pos = center; pos <= 150; pos++) {
    s_d5.write(pos);
    delay(30);
  }

  Serial.println("READY: 1=Start, 0=Stop, 2=Detach");
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();

    if (command == '1') {
      // 脱力からの復帰
      if (!s_fast.attached()) s_fast.attach(pin_sg92r, 500, 2400);
      if (!s_d4.attached())   s_d4.attach(pin_d4_serv, 500, 2500);
      if (!s_d5.attached())   s_d5.attach(pin_d5_serv, 500, 2500);

      // 予告点滅
      for (int i = 0; i < 10; i++) {
        digitalWrite(LED_ACTION, HIGH); delay(100);
        digitalWrite(LED_ACTION, LOW);  delay(100);
      }

      // D5 の初期状態
      st_d5.currentPos = 150.0;
      st_d5.dir = -1;

      isMoving = true;
      digitalWrite(LED_ACTION, HIGH);
    }
    else if (command == '0' && !isMoving) {
      digitalWrite(LED_ACTION, LOW);
      digitalWrite(LED_CONNECT, HIGH); delay(500);
      digitalWrite(LED_CONNECT, LOW);
    }
    else if (command == '2') {
      isMoving = false;
      s_fast.detach();
      s_d4.detach();
      s_d5.detach();
      digitalWrite(LED_ACTION, LOW);
    }
  }

  if (isMoving) {
    unsigned long now = millis();
    if (now - last_update >= update_interval) {
      last_update = now;

      // --- SG92R 爆速 ---
      st_f.currentPos += st_f.step * st_f.dir;
      if (st_f.currentPos >= st_f.high || st_f.currentPos <= st_f.low)
        st_f.dir *= -1;
      s_fast.write((int)st_f.currentPos);

      // --- D4 60-90 ---
      st_d4.currentPos += st_d4.step * st_d4.dir;
      if (st_d4.currentPos >= st_d4.high || st_d4.currentPos <= st_d4.low)
        st_d4.dir *= -1;
      s_d4.write((int)st_d4.currentPos);

      // --- D5：150 → 120 → 60–120 往復 ---
      st_d5.currentPos += st_d5.step * st_d5.dir;

      // ① 150 → 降下 → 120 を下回ったら往復モードへ
      if (st_d5.dir == -1 && st_d5.currentPos <= st_d5.high) {
        // 降下継続
      }

      // ② 往復モード：60–120 の間で反転
      if (st_d5.currentPos <= st_d5.low) {
        st_d5.dir = 1;
      }
      else if (st_d5.currentPos >= st_d5.high) {
        st_d5.dir = -1;
      }

      s_d5.write((int)st_d5.currentPos);
    }
  }
}