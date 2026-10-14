package expo.modules.alarmring

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log

class RingService : Service() {
  private var player: MediaPlayer? = null
  private val handler = Handler(Looper.getMainLooper())

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopSelf()
      return START_NOT_STICKY
    }
    val label = intent?.getStringExtra(EXTRA_LABEL).orEmpty()
    startForeground(
      NOTIFICATION_ID,
      buildNotification(label),
      ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
    )
    startRinging()
    handler.removeCallbacksAndMessages(null)
    handler.postDelayed({ stopSelf() }, RING_TIMEOUT_MS)
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    getSystemService(Vibrator::class.java).cancel()
    player?.release()
    player = null
    sendBroadcast(Intent(ACTION_RINGING_STOPPED).setPackage(packageName))
    super.onDestroy()
  }

  // The default alarm tone can be missing (some phones and emulators), so fall back to other defaults.
  private fun startRinging() {
    player?.release()
    player = null
    val toneTypes = listOf(
      RingtoneManager.TYPE_ALARM,
      RingtoneManager.TYPE_RINGTONE,
      RingtoneManager.TYPE_NOTIFICATION
    )
    for (type in toneTypes) {
      val tone = RingtoneManager.getDefaultUri(type) ?: continue
      try {
        player = createPlayer(tone)
        return
      } catch (e: Exception) {
        Log.e(TAG, "Could not play tone type $type", e)
      }
    }
    vibrate()
  }

  // Last resort so the alarm is never silent if no sound can play.
  private fun vibrate() {
    getSystemService(Vibrator::class.java)
      .vibrate(VibrationEffect.createWaveform(longArrayOf(0, 800, 600), 0))
  }

  private fun createPlayer(tone: Uri): MediaPlayer {
    val newPlayer = MediaPlayer()
    try {
      newPlayer.apply {
        setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        )
        // Keeps the CPU awake while playing with the screen off.
        setWakeMode(this@RingService, PowerManager.PARTIAL_WAKE_LOCK)
        setOnErrorListener { _, what, extra ->
          Log.e(TAG, "Player error $what/$extra")
          release()
          player = null
          vibrate()
          true
        }
        setDataSource(this@RingService, tone)
        isLooping = true
        prepare()
        start()
      }
    } catch (e: Exception) {
      newPlayer.release()
      throw e
    }
    return newPlayer
  }

  private fun buildNotification(label: String): Notification {
    RingChannel.ensureCreated(this)
    val stopIntent = PendingIntent.getService(
      this, 0,
      Intent(this, RingService::class.java).setAction(ACTION_STOP),
      PendingIntent.FLAG_IMMUTABLE
    )
    val ringScreen = PendingIntent.getActivity(
      this, 0,
      Intent(this, RingActivity::class.java)
        .putExtra(EXTRA_LABEL, label)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )
    return Notification.Builder(this, RingChannel.ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(label)
      .setContentText("Time's up!")
      .setCategory(Notification.CATEGORY_ALARM)
      .setOngoing(true)
      .setContentIntent(ringScreen)
      .setFullScreenIntent(ringScreen, true)
      .addAction(Notification.Action.Builder(null, "Stop", stopIntent).build())
      .build()
  }

  companion object {
    const val EXTRA_LABEL = "label"
    const val ACTION_STOP = "expo.modules.alarmring.STOP"
    const val ACTION_RINGING_STOPPED = "expo.modules.alarmring.RINGING_STOPPED"
    private const val TAG = "RingService"
    private const val NOTIFICATION_ID = 1
    private const val RING_TIMEOUT_MS = 2 * 60 * 1000L
  }
}
