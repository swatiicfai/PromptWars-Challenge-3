import os
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

def create_presentation_video():
    output_dir = "Presentation_Output"
    screenshots_dir = "screenshots"
    
    slide_images = [
        "dashboard.png",     # Slide 1: Welcome
        "dashboard.png",     # Slide 2: Challenge
        "calculator.png",    # Slide 3: Terralife Solution
        "daily-habits.png",  # Slide 4: Gamified Sustainability
        "eco-hub.png",       # Slide 5: Carbon Swap Simulator
        "challenges.png",    # Slide 6: Tech Stack
        "dashboard.png"      # Slide 7: Thank you
    ]
    
    clips = []
    
    for i in range(7):
        audio_path = os.path.join(output_dir, f"slide_{i+1}_voice.mp3")
        image_path = os.path.join(screenshots_dir, slide_images[i])
        
        # Load audio to get its duration
        audio_clip = AudioFileClip(audio_path)
        
        # Load image and set its duration to match the audio
        image_clip = ImageClip(image_path).with_duration(audio_clip.duration)
        
        # Set the audio of the image clip
        video_clip = image_clip.with_audio(audio_clip)
        
        clips.append(video_clip)
        
    print("Concatenating clips...")
    final_video = concatenate_videoclips(clips, method="compose")
    
    output_path = os.path.join(output_dir, "Terralife_Presentation_Video.mp4")
    print(f"Writing video to {output_path}...")
    
    # Write the result to a file (fps=2 is enough for static images)
    final_video.write_videofile(output_path, fps=2, audio_codec="aac")
    print("Video generation complete!")

if __name__ == "__main__":
    create_presentation_video()
