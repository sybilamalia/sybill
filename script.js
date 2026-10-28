$(function () {
  const PI = Math.PI;
  let aktif = "kubus";

  const bangunRuang = {
    kubus: {
      nama: "Kubus", ikon: "🧊", rumus: "V = s³ | LP = 6 × s²",
      input: [{ id: "s", label: "Panjang sisi (s)" }],
      hitung: v => ({ volume: Math.pow(v.s, 3), luas: 6 * v.s * v.s })
    },
    balok: {
      nama: "Balok", ikon: "📦", rumus: "V = p × l × t | LP = 2(pl + pt + lt)",
      input: [{ id: "p", label: "Panjang (p)" }, { id: "l", label: "Lebar (l)" }, { id: "t", label: "Tinggi (t)" }],
      hitung: v => ({ volume: v.p * v.l * v.t, luas: 2 * (v.p * v.l + v.p * v.t + v.l * v.t) })
    },
    tabung: {
      nama: "Tabung", ikon: "🥫", rumus: "V = π × r² × t | LP = 2πr(r + t)",
      input: [{ id: "r", label: "Jari-jari (r)" }, { id: "t", label: "Tinggi (t)" }],
      hitung: v => ({ volume: PI * v.r * v.r * v.t, luas: 2 * PI * v.r * (v.r + v.t) })
    },
    kerucut: {
      nama: "Kerucut", ikon: "🔺", rumus: "V = ⅓πr²t | LP = πr(r + s), s = √(r² + t²)",
      input: [{ id: "r", label: "Jari-jari (r)" }, { id: "t", label: "Tinggi (t)" }],
      hitung: v => {
        const s = Math.sqrt(v.r * v.r + v.t * v.t);
        return { volume: PI / 3 * v.r * v.r * v.t, luas: PI * v.r * (v.r + s), extra: "Garis pelukis (s) = " + format(s) };
      }
    },
    bola: {
      nama: "Bola", ikon: "⚽", rumus: "V = ⁴⁄₃ × π × r³ | LP = 4πr²",
      input: [{ id: "r", label: "Jari-jari (r)" }],
      hitung: v => ({ volume: 4 / 3 * PI * Math.pow(v.r, 3), luas: 4 * PI * v.r * v.r })
    },
    limas: {
      nama: "Limas Segi Empat", ikon: "🛖", rumus: "V = ⅓ × a² × t | LP = a² + 2 × a × ts",
      input: [{ id: "a", label: "Sisi alas persegi (a)" }, { id: "t", label: "Tinggi limas (t)" }],
      hitung: v => {
        const ts = Math.sqrt(v.t * v.t + Math.pow(v.a / 2, 2));
        return { volume: v.a * v.a * v.t / 3, luas: v.a * v.a + 2 * v.a * ts, extra: "Tinggi sisi tegak (ts) = " + format(ts) };
      }
    },
    prisma: {
      nama: "Prisma Segitiga Siku-siku", ikon: "📐", rumus: "V = ½ × a × b × t | LP = ab + (a + b + c) × t",
      input: [{ id: "a", label: "Alas segitiga (a)" }, { id: "b", label: "Tinggi segitiga (b)" }, { id: "t", label: "Tinggi prisma (t)" }],
      hitung: v => {
        const c = Math.sqrt(v.a * v.a + v.b * v.b);
        return { volume: .5 * v.a * v.b * v.t, luas: v.a * v.b + (v.a + v.b + c) * v.t, extra: "Sisi miring segitiga (c) = " + format(c) };
      }
    },
    belahan: {
      nama: "Belahan Bola (Setengah Bola)", ikon: "🌓", rumus: "V = ⅔ × π × r³ | LP = 3πr² (termasuk alas)",
      input: [{ id: "r", label: "Jari-jari (r)" }],
      hitung: v => ({ volume: 2 / 3 * PI * Math.pow(v.r, 3), luas: 3 * PI * v.r * v.r })
    }
  };

  function format(angka) {
    return angka.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  function buatDaftarBangun() {
    const $wadah = $("#daftarBangun").empty();
    $.each(bangunRuang, function (kunci, b) {
      $("<button>", {
        type: "button",
        class: "shape-btn" + (kunci === aktif ? " active" : ""),
        "data-bangun": kunci,
        html: '<span class="ico">' + b.ikon + '</span>' + b.nama
      }).appendTo($wadah);
    });
  }

  function pilihBangun(kunci) {
    aktif = kunci;
    const b = bangunRuang[kunci];
    $("#judul").text(b.ikon + " " + b.nama);
    $("#rumus").text("Rumus: " + b.rumus);
    const $inputs = $("#inputs").empty();

    $.each(b.input, function (_, f) {
      const $field = $("<div>", { class: "field" });
      $("<label>", { for: f.id, text: f.label }).appendTo($field);
      $("<input>", {
        type: "number", id: f.id, name: f.id, min: "0", step: "any",
        placeholder: "Masukkan nilai", inputmode: "decimal", required: true
      }).appendTo($field);
      $field.appendTo($inputs);
    });

    $("#pesan").text("");
    $("#hasil").stop(true, true).hide().empty();
    buatDaftarBangun();
  }

  function ambilNilai() {
    const b = bangunRuang[aktif];
    const nilai = {};
    let valid = true;
    let pesan = "";

    $.each(b.input, function (_, f) {
      const $input = $("#" + f.id);
      const raw = $input.val();
      const angka = Number(raw);
      if (raw.trim() === "" || !Number.isFinite(angka) || angka <= 0) {
        $input.addClass("invalid");
        valid = false;
        pesan = 'Input "' + f.label + '" harus berupa angka lebih dari 0.';
      } else {
        $input.removeClass("invalid");
        nilai[f.id] = angka;
      }
    });
    return { valid, nilai, pesan };
  }

  function hitungDanTampilkan(tampilkanPesan) {
    const data = ambilNilai();
    if (!data.valid) {
      $("#hasil").stop(true, true).slideUp(180);
      $("#pesan").text(tampilkanPesan ? data.pesan : "Isi semua nilai dengan angka lebih dari 0 untuk melihat hasil.");
      return false;
    }

    $("#pesan").text("");
    const b = bangunRuang[aktif];
    const h = b.hitung(data.nilai);
    const rincian = b.input.map(f => f.label + " = " + format(data.nilai[f.id])).join(", ");

    let html = '<h3>Hasil Perhitungan ' + b.nama + '</h3>';
    html += '<p><strong>Diketahui:</strong> ' + rincian + '</p>';
    if (h.extra) html += '<p>' + h.extra + '</p>';
    html += '<div class="result-grid">';
    html += '<div class="result-item"><span class="result-label">Volume</span><span class="result-value">' + format(h.volume) + ' satuan³</span></div>';
    html += '<div class="result-item"><span class="result-label">Luas Permukaan</span><span class="result-value">' + format(h.luas) + ' satuan²</span></div>';
    html += '</div>';

    $("#hasil").html(html).stop(true, true).slideDown(220);
    return true;
  }

  // Event handler jQuery: memilih bangun ruang
  $("#daftarBangun").on("click", ".shape-btn", function () {
    pilihBangun($(this).data("bangun"));
  });

  // Validasi dan perhitungan saat tombol Hitung ditekan
  $("#form").on("submit", function (e) {
    e.preventDefault();
    hitungDanTampilkan(true);
  });

  // Validasi otomatis dan hasil berubah secara real-time saat nilai diketik
  $("#inputs").on("input", "input", function () {
    $(this).removeClass("invalid");
    hitungDanTampilkan(false);
  });

  // Reset input dan hasil dengan efek jQuery
  $("#btnReset").on("click", function () {
    $("#form")[0].reset();
    $("#pesan").text("");
    $("#inputs input").removeClass("invalid");
    $("#hasil").stop(true, true).slideUp(180, function () { $(this).empty(); });
  });

  // Animasi sederhana saat halaman dimuat
  $("header").hide().fadeIn(500);
  $(".card").hide().delay(150).fadeIn(450);
  pilihBangun(aktif);
});