import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';

class SoundService {
  static final AudioPlayer _player = AudioPlayer();

  static Future<void> playCorrect() async {
    try {
      HapticFeedback.mediumImpact();
      await SystemSound.play(SystemSoundType.click);
      await _player.stop();
      await _player.play(AssetSource('sounds/correct.mp3'), volume: 0.8);
    } catch (_) {
      HapticFeedback.mediumImpact();
    }
  }

  static Future<void> playWrong() async {
    try {
      HapticFeedback.vibrate();
      await _player.stop();
      await _player.play(AssetSource('sounds/wrong.mp3'), volume: 0.8);
    } catch (_) {
      HapticFeedback.vibrate();
    }
  }

  static Future<void> playClick() async {
    try {
      HapticFeedback.lightImpact();
      await SystemSound.play(SystemSoundType.click);
    } catch (_) {}
  }
}
