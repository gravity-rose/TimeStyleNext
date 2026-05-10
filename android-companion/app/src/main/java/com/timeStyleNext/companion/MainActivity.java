package com.timeStyleNext.companion;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.getpebble.android.kit.PebbleKit;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 100;
    private RecyclerView recyclerView;
    private View permissionView;
    private CalendarAdapter adapter;
    private PebbleReceiver pebbleReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        try {
            pebbleReceiver = new PebbleReceiver();
            PebbleKit.registerReceivedDataHandler(this, pebbleReceiver);
        } catch (Exception e) {
            android.util.Log.e("TimeStyleCompanion", "Failed to register PebbleKit receiver", e);
        }

        recyclerView = findViewById(R.id.calendar_list);
        permissionView = findViewById(R.id.permission_section);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        findViewById(R.id.grant_permission_btn).setOnClickListener(v -> requestCalendarPermission());

        if (hasCalendarPermission()) {
            showCalendarList();
        } else {
            showPermissionRequest();
        }
    }

    private boolean hasCalendarPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CALENDAR)
            == PackageManager.PERMISSION_GRANTED;
    }

    private void requestCalendarPermission() {
        ActivityCompat.requestPermissions(this,
            new String[]{Manifest.permission.READ_CALENDAR},
            PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                showCalendarList();
            } else {
                Toast.makeText(this, "Calendar permission is required to show events on your Pebble.", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void showPermissionRequest() {
        permissionView.setVisibility(View.VISIBLE);
        recyclerView.setVisibility(View.GONE);
    }

    private void showCalendarList() {
        permissionView.setVisibility(View.GONE);
        recyclerView.setVisibility(View.VISIBLE);

        List<CalendarHelper.CalendarInfo> calendars = CalendarHelper.getCalendars(this);
        Set<Long> selected = PebbleReceiver.loadSelectedCalendarIds(this);
        adapter = new CalendarAdapter(calendars, selected);
        recyclerView.setAdapter(adapter);
    }

    private class CalendarAdapter extends RecyclerView.Adapter<CalendarAdapter.ViewHolder> {
        private final List<CalendarHelper.CalendarInfo> calendars;
        private final Set<Long> selected;

        CalendarAdapter(List<CalendarHelper.CalendarInfo> calendars, Set<Long> selected) {
            this.calendars = calendars;
            this.selected = new HashSet<>(selected);
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_calendar, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            CalendarHelper.CalendarInfo cal = calendars.get(position);
            holder.name.setText(cal.displayName);
            holder.account.setText(cal.accountName);
            holder.checkbox.setOnCheckedChangeListener(null);
            holder.checkbox.setChecked(selected.contains(cal.id));
            holder.checkbox.setOnCheckedChangeListener((btn, isChecked) -> {
                if (isChecked) {
                    selected.add(cal.id);
                } else {
                    selected.remove(cal.id);
                }
                PebbleReceiver.saveSelectedCalendarIds(MainActivity.this, selected);
                PebbleReceiver.pushEventsToWatch(MainActivity.this);
            });
            holder.itemView.setOnClickListener(v -> holder.checkbox.toggle());
        }

        @Override
        public int getItemCount() {
            return calendars.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            CheckBox checkbox;
            TextView name, account;

            ViewHolder(View v) {
                super(v);
                checkbox = v.findViewById(R.id.calendar_checkbox);
                name = v.findViewById(R.id.calendar_name);
                account = v.findViewById(R.id.calendar_account);
            }
        }
    }
}
