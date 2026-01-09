import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mantra',
  templateUrl: './mantra.component.html',
  styleUrls: ['./mantra.component.css']
})
export class MantraComponent implements OnDestroy {
  form: FormGroup;
  currentCount = 0;
  isPlaying = false;

  units: string[] = [];
  progress = 0; // 0 → 1 progress of current iteration
  private animationId?: number;
  private iterationStart = 0;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      mantra: ['', Validators.required],
      targetCount: [108, [Validators.required, Validators.min(1)]],
      speed: [2, [Validators.required, Validators.min(0.5)]]
    });
  }

  start() {
    if (this.form.invalid) return;

    this.stop();
    this.currentCount = 1;
    this.isPlaying = true;
    this.prepareUnits();

    this.iterationStart = performance.now();
    this.progress = 0;

    this.animateFrame();
  }

  private animateFrame = () => {
    const now = performance.now();
    const speedMs = this.form.value.speed * 1000;
    this.progress = Math.min((now - this.iterationStart) / speedMs, 1);

    if (this.progress >= 1) {
      this.currentCount++;
      if (this.currentCount > this.form.value.targetCount) {
        this.currentCount = this.form.value.targetCount;
        this.stop();
        return;
      }
      // Start next iteration
      this.iterationStart = performance.now();
      this.progress = 0;
    }

    this.animationId = requestAnimationFrame(this.animateFrame);
  };

  prepareUnits() {
    const mantra: string = this.form.value.mantra.trim();
    this.units = mantra.split(' ');
  }

  getWordGlow(i: number): number {
  if (!this.units.length) return 0.25; // default opacity
  const glow = this.progress * this.units.length - i;
  return 0.25 + 0.75 * Math.max(0, Math.min(glow, 1));
}

  stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId!);
    this.animationId = undefined;
    this.progress = 0;
  }

  ngOnDestroy() {
    this.stop();
  }
}
