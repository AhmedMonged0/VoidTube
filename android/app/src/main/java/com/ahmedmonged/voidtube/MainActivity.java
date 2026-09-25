package com.ahmedmonged.voidtube;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    if (mimetype != null && !mimetype.isEmpty()) {
                        request.setMimeType(mimetype);
                    }
                    String cookies = CookieManager.getInstance().getCookie(url);
                    if (cookies != null) {
                        request.addRequestHeader("cookie", cookies);
                    }
                    if (userAgent != null) {
                        request.addRequestHeader("User-Agent", userAgent);
                    }
                    request.setDescription("جارٍ تنزيل الملف عبر VoidTube...");
                    String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
                    request.setTitle(filename);
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);

                    DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                    if (dm != null) {
                        dm.enqueue(request);
                        Toast.makeText(getApplicationContext(), "بدأ التنزيل في الإشعارات: " + filename, Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW);
                        intent.setData(Uri.parse(url));
                        startActivity(intent);
                    } catch (Exception ex) {
                        Toast.makeText(getApplicationContext(), "تعذر بدء التنزيل", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }
    }
}

