package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"main/models"
	"time"

	"github.com/labstack/echo/v4"
)

// HandleHealth はヘルスチェックエンドポイントのハンドラー
func HandleHealth(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "healthy",
	})
}

// HandleGetAlarm はアラームデータを取得して返すハンドラー
func HandleGetAlarm(c echo.Context) error {
	// 1. shared/py2go/data ディレクトリ内のJSONファイル一覧を取得
	dataDir := "./shared/py2go/data"
	entries, err := os.ReadDir(dataDir)
	if err != nil {
		c.Logger().Errorf("Failed to read data directory: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to read data directory",
		})
	}

	// JSONファイルのみをフィルタリング
	var jsonFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".json" {
			jsonFiles = append(jsonFiles, entry.Name())
		}
	}

	// JSONファイルが存在しない場合
	if len(jsonFiles) == 0 {
		c.Logger().Warn("No JSON files found in data directory")
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "No JSON files found",
		})
	}

	// 2. JSONファイルからランダムに一つを選ぶ
	rand.Seed(time.Now().UnixNano())
	selectedFile := jsonFiles[rand.Intn(len(jsonFiles))]
	jsonPath := filepath.Join(dataDir, selectedFile)
	c.Logger().Infof("Selected JSON file: %s", selectedFile)

	// JSONファイルを読み込む
	data, err := os.ReadFile(jsonPath)
	if err != nil {
		c.Logger().Errorf("Failed to read JSON file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to read JSON file",
		})
	}

	// JSONをパース
	var alarmData models.AlarmData
	if err := json.Unmarshal(data, &alarmData); err != nil {
		c.Logger().Errorf("Failed to parse JSON file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to parse JSON file",
		})
	}

	// レスポンス用の構造体にデータをセット
	alarmDataResponse := models.AlarmDataResponse{
		BaseMusic: alarmData.BaseMusic,
		Pitch:     alarmData.Pitch,
		Speed:     alarmData.Speed,
	}

	// 3. 音声ファイルを読み込んでエンコード
	audioFilePath := "./shared/py2go/music/" + alarmData.FileName
	c.Logger().Infof("Reading audio file: %s", alarmData.FileName)
	audioData, err := os.ReadFile(audioFilePath)
	if err != nil {
		c.Logger().Errorf("Failed to read audio file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to read audio file",
		})
	}

	// base64エンコード
	alarmDataResponse.Audio = base64.StdEncoding.EncodeToString(audioData)

	// レスポンスを送信
	responseErr := c.JSON(http.StatusOK, alarmDataResponse)

	// 4. 送信したJSONファイルとWAVファイルを削除
	if err := os.Remove(jsonPath); err != nil {
		log.Printf("Warning: Failed to delete JSON file %s: %v", jsonPath, err)
	}

	if err := os.Remove(audioFilePath); err != nil {
		log.Printf("Warning: Failed to delete WAV file %s: %v", audioFilePath, err)
	}

	return responseErr
}

// HandleAlarmReview はアラームのレビューを受け付けるハンドラー
func HandleAlarmReview(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "OK",
	})
}

func HandleAlarmWakeUp(c echo.Context) error {
	// 1. フォームデータの取得（AI用の項目も追加）
	lastBaseMusic := c.FormValue("last-base-music")
	lastPitch := c.FormValue("last-pitch")
	lastSpeed := c.FormValue("last-speed")
	diffSeconds := c.FormValue("diffSeconds")

	// 数値変換（AI側が数値として読み取るため）
	pitchInt, _ := strconv.Atoi(lastPitch)
	speedInt, _ := strconv.Atoi(lastSpeed)
	diffSecInt, _ := strconv.Atoi(diffSeconds)

	c.Logger().Infof("--- WakeUp Data Received ---")
	c.Logger().Infof("Music: %s, Diff: %d sec", lastBaseMusic, diffSecInt)

	// 2. 保存先ディレクトリの設定
	// 絶対パス "/GoServer/shared" を使うのが今のDocker環境では最も安定します
	baseDir := "/GoServer/shared/go2py"

	// 💡 フォルダ作成 (動いていた時の 0755 か、より緩い 0777)
	if err := os.MkdirAll(baseDir, 0777); err != nil {
		c.Logger().Errorf("DIRECTORY ERROR: %v", err)
		// 権限エラーで止まらないように return せずログだけに留めるのも手です
	}

	// 3. ファイル名の決定 (UUID風に毎回ユニークにする)
	timestamp := time.Now().Format("20060102_150405")
	jsonFileName := fmt.Sprintf("wake_up_%s_%d.json", timestamp, rand.Intn(1000))
	jsonPath := filepath.Join(baseDir, jsonFileName)

	// 4. メタデータをAIの指定フォーマットで構成
	wakeUpData := map[string]interface{}{
		"last-base-music": lastBaseMusic,
		"last-pitch":      pitchInt,
		"last-speed":      speedInt,
		"wake_up_time":    diffSecInt,
	}

	jsonData, _ := json.MarshalIndent(wakeUpData, "", "  ")

	// 5. 書き出し
	// os.WriteFile を使用（動いていた実績のある方法）
	if err := os.WriteFile(jsonPath, jsonData, 0666); err != nil {
		c.Logger().Errorf("Failed to write JSON: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Permission Denied"})
	}

	c.Logger().Infof("Metadata JSON saved to: %s", jsonPath)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   wakeUpData,
	})
}