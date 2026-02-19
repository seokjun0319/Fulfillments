import time
import subprocess
import pyautogui
import requests

# ==========================================
# [설정] 대장님의 파일 ID와 로컬 경로만 넣어주세요!
# ==========================================
# 1. 구글 드라이브 파일 ID (주소창에서 복사한 것)
TRIGGER_FILE_ID = "1uZWuWvZsAz5h_upN9KdNdGcYVROD49ge"
INSTRUCTION_FILE_ID = "1ke7WJs9qfvszKIhYUpT955SbXcSamq1I"

# 2. 대장님의 로컬 프로젝트 폴더 경로
LOCAL_PROJECT = r"C:\Users\ezmedicom\causor\fulfillment-info"
# ==========================================

# 구글 드라이브 직다운로드 주소 템플릿
def get_drive_url(file_id):
    return f"https://docs.google.com/uc?export=download&id={file_id}"

def start_delivery():
    last_instruction = "" # 마지막으로 일한 내용 기억
    print(f"🚀 클라우드 감시 가동 중... (대상 프로젝트: {LOCAL_PROJECT})")
    
    while True:
        try:
            # 1. 클라우드에서 trigger.txt 읽기
            r = requests.get(get_drive_url(TRIGGER_FILE_ID))
            content = r.text.strip()

            if "NEW" in content:
                # 2. 지시 내용 가져오기
                r_ins = requests.get(get_drive_url(INSTRUCTION_FILE_ID))
                instruction_text = r_ins.text.strip()

                # 새로운 지시인지 확인 (중복 작업 방지)
                if instruction_text != last_instruction:
                    print("\n🔔 [신호 포착] 클라우드에서 새 지시를 확인했습니다!")
                    
                    # 로컬 지시서 파일 업데이트
                    local_path = os.path.join(LOCAL_PROJECT, "INSTRUCTION_FOR_CURSOR.md")
                    with open(local_path, "w", encoding="utf-8") as f:
                        f.write(instruction_text)

                    # 3. 노예(Cursor) 소환 및 자동 타이핑
                    subprocess.run(["cursor", LOCAL_PROJECT], shell=True)
                    time.sleep(4) # 로딩 대기

                    pyautogui.hotkey('ctrl', 'i') # Composer 열기
                    time.sleep(1)
                    pyautogui.write("@INSTRUCTION_FOR_CURSOR.md 읽고 바로 작업 시작해.", interval=0.05)
                    pyautogui.press('enter')
                    
                    print("✅ 작업 하달 완료!")
                    last_instruction = instruction_text # 작업 완료 기억

        except Exception as e:
            print(f"⚠️ 연결 확인 중... (에러: {e})")

        time.sleep(15) # 15초마다 클라우드 체크

if __name__ == "__main__":
    import os
    start_delivery()